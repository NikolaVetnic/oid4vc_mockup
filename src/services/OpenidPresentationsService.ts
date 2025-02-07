import { Request, Response } from "express";
import { randomUUID } from "crypto";
import base64url from "base64url";
import {
    SignJWT,
    jwtVerify,
    importPKCS8,
    importSPKI,
    decodeProtectedHeader,
    generateKeyPair,
} from "jose";
import { holderDummyRSAKeys, verifierDummyKeys } from "./generateDummyKeyPair";

const rpStateStore = new Map<string, any>(); // In-memory store for RP state (keyed by the state value)

export class OpenidPresentationsService {
    async getRpState(state: string): Promise<any> {
        return rpStateStore.get(state);
    }

    async saveRpState(rpState: any): Promise<void> {
        rpStateStore.set(rpState.state, rpState);
    }

    async generateSignedRequestObject(
        presentationDefinition: any
    ): Promise<any> {
        const state = randomUUID();
        console.log("🗒️ state:", state);

        const nonce = randomUUID();
        console.log("🗒️ nonce:", nonce);

        const response_uri = "http://localhost:4000/back-to-wallet";
        const client_id = "localhost";

        const payload = {
            response_uri,
            aud: "https://self-issued.me/v2",
            iss: client_id,
            client_id_scheme: "x509_san_dns",
            client_id,
            response_type: "vp_token",
            response_mode: "direct_post.jwt",
            state,
            nonce,
            presentation_definition: presentationDefinition,
        };

        console.log("🗒️ payload", payload);

        const verifierPrivateRsaKey = await importPKCS8(
            verifierDummyKeys.privateKey,
            "RS256"
        );

        // Sign the payload to create the signed request object.
        const signedRequestObject = await new SignJWT(payload)
            .setProtectedHeader({ alg: "RS256" })
            .setIssuedAt()
            .setExpirationTime("2h")
            .sign(verifierPrivateRsaKey);

        /*
            Store the Relying Party state, which would normally include more
            details. RP is part of the OpenID Connect Core specification, m-
            ore info: https://openid.net/specs/openid-connect-core-1_0.html
        */
        const rpState = {
            state,
            nonce,
            presentation_definition: presentationDefinition,
            callback_endpoint: response_uri,
            client_id,
            signed_request: signedRequestObject,
        };
        await this.saveRpState(rpState);

        console.log("🗒️ rpState", rpState);

        return { state, signedRequestObject };
    }

    // Verify the presentation token received at the callback endpoint.
    async verifyPresentationToken(req: Request, res: Response): Promise<void> {
        try {
            const vp_token = req.body?.vp_token;
            const state = req.body?.state;

            if (!vp_token || !state) {
                res.status(400).send({ error: "Missing vp_token or state" });
                return;
            }

            // Retrieve the corresponding RP state.
            const rpState = await this.getRpState(state);
            if (!rpState) {
                res.status(404).send({ error: "RP state not found" });
                return;
            }

            // Validate the VP token.
            const verifiedPayload = await this.validateVpToken(vp_token, state);

            // Update the stored RP state with verification details.
            rpState.vp_token = base64url.encode(JSON.stringify(vp_token));
            rpState.verifiedClaims = verifiedPayload;
            rpState.response_code = base64url.encode(randomUUID());
            await this.saveRpState(rpState);

            // Respond with a redirect URI that includes the response code.
            res.send({
                redirect_uri:
                    rpState.callback_endpoint +
                    "#response_code=" +
                    rpState.response_code,
            });
        } catch (err) {
            res.status(500).send({
                error: err instanceof Error ? err.message : "Unknown error",
            });
        }
    }

    // Simplified VP token validation: verify the JWT and check the state.
    async validateVpToken(
        vp_token: string,
        expectedState: string
    ): Promise<any> {
        const holderPublicRsaKey = await importSPKI(
            holderDummyRSAKeys.publicKey,
            "RSA256"
        );

        try {
            const { payload } = await jwtVerify(vp_token, holderPublicRsaKey, {
                audience: "http://localhost:4000/generateCredential",
            });

            if (decodeProtectedHeader(vp_token).state !== expectedState)
                throw new Error("State mismatch");

            return payload;
        } catch (err) {
            throw new Error(`VP token verification failed: ${err}`);
        }
    }

    async signVpToken(payload: any) {
        const [rsaImportedPrivateKey, _] = await Promise.all([
            importPKCS8(holderDummyRSAKeys.privateKey, "RS256"),
            generateKeyPair("ECDH-ES"),
        ]);

        return await new SignJWT(payload.vp)
            .setProtectedHeader({ alg: "RS256", state: payload.state })
            .setIssuer(payload.iss)
            .setAudience(payload.aud)
            .setIssuedAt(payload.iat)
            .setExpirationTime("2h")
            .sign(rsaImportedPrivateKey);
    }
}
