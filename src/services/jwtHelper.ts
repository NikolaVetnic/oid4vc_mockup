import jwt from "jsonwebtoken";
import { issuerDummyKeys } from "./generateDummyKeyPair";

// Payload, or Claims.
const payload = {
    nonce: "5319db3a5ddc9c7c347cd8d05b453a7d",
    aud: "http://wallet-entreprise-disploma-issuer:8000",
    iss: "CLIENT123",
    iat: Math.floor(Date.now() / 1000),
};

const { privateKey, publicKey } = issuerDummyKeys;

// Used for understanding purposes only.
export function generateAndVerifyJWT(): { token: string; decoded: any } {
    // Include 'alg' in the header to satisfy the type definitions.
    const token = jwt.sign(payload, privateKey, {
        algorithm: "ES256",
        header: { alg: "ES256", typ: "openid4vci-proofjwt" },
    });

    // To verify later:
    const decoded = jwt.verify(token, publicKey, { algorithms: ["ES256"] });

    return { token, decoded };
}

export function generateProofJWT(): { token: string; decoded: any } {
    // Define the header with the required JWK information.
    // Ensure that the public key details here correspond to the private key.
    const header = {
        alg: "ES256",
        typ: "openid4vci-proof+jwt",
        jwk: {
            crv: "P-256",
            ext: true,
            key_ops: ["verify"],
            kty: "EC",
            x: "QJ_UAoe6WoWhYCkiBCIu046zKZWINqtGTDeAToWDBRM", // ToDo: Are this components of the holder public key?
            y: "ZQZBl57pksvczwtn0I04Nj6tahmdVUpT4Jujgsj_eAc",
        },
    };

    // Sign the JWT with the provided payload, private key, and header.
    // Note: The 'algorithm' option must match the header 'alg'.
    const token = jwt.sign(payload, privateKey, { algorithm: "ES256", header });
    const decoded = jwt.decode(token, { complete: true });

    return { token, decoded };
}
