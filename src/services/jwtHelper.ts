import jwt from "jsonwebtoken";
import { createPublicKey } from "crypto";

export function generateProofJWT(
    proofPayload: any,
    publicKey: string,
    privateKey: string
): { token: string; decoded: any } {
    const jwk = createPublicKey(publicKey).export({ format: "jwk" });

    /*
        Define the header with the required JWK information. Ensure that
        the public key details here correspond to the private key.
    */
    const header = {
        alg: "ES256",
        typ: "openid4vci-proof+jwt",
        jwk,
    };

    /*
        Sign the JWT with the provided payload, private key, and header.
        Note: The 'algorithm' option must match the header 'alg'.
    */
    const token = jwt.sign(proofPayload, privateKey, {
        algorithm: "ES256",
        header,
    });
    const decoded = jwt.decode(token, { complete: true });

    return { token, decoded };
}
