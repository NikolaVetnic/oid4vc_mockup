import { Request, Response } from "express";
import { randomUUID } from "crypto";
import base64url from "base64url";
import { SignJWT, jwtVerify, importPKCS8, importSPKI } from "jose";
import { issuerDummyRSAKeys, verifierDummyKeys } from "./generateDummyKeyPair";

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

    /*
        Verify the presentation token received at the callback endpoint.
    */
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

            const verifiedPayload = await this.validateVpToken(vp_token);

            rpState.vp_token = base64url.encode(JSON.stringify(vp_token));
            rpState.verifiedClaims = verifiedPayload;
            rpState.response_code = base64url.encode(randomUUID());
            await this.saveRpState(rpState);

            /*
                Respond with a redirect URI that includes within the response c-
                ode.
            */
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

    async validateVpToken(vp_token: string): Promise<any> {
        /*
            Here the issuer's public key is imported in PEM format. In a re-
            al world scenario is derived thusly:
            1. The issuer's identity (e.g., iss claim in the JWT) is used to
            locate its public key. E.g. if the issuer is identified by a DID
            (Decentralized Identifier), you would resolve their DID document
            to fetch the public key.
            - Source on how to resolve a DID to a DID document and how publ-
            ic keys are embedded in DID docs: https://www.w3.org/TR/did-1.0/
            - Source on how the issuer is identified in a VC and how the is-
            suer's public key is used: https://www.w3.org/TR/vc-data-model/
            2. Use the iss claim in the JWT to fetch the issuer's public key
            from a trusted source.
         */
        const issuerPublicKey = await importSPKI(
            issuerDummyRSAKeys.publicKey, // your issuer's public key in PEM format
            "RS256"
        );

        try {
            // Verify the signed JWT. You can also add additional claims validation (issuer, audience, etc.)
            const { payload } = await jwtVerify(vp_token, issuerPublicKey, {
                audience: "user-wallet", // optionally enforce the audience
            });
            console.log("🗒️ jwt is valid - payload", payload);

            return payload;
        } catch (err) {
            throw new Error(`VP token verification failed: ${err}`);
        }
    }
}
