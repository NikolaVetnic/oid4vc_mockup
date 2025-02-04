import { generateKeyPairSync } from "crypto";

export function generateDummyKeyPair() {
    const { privateKey, publicKey } = generateKeyPairSync("ec", {
        namedCurve: "prime256v1", // or 'secp256k1', etc.
        privateKeyEncoding: {
            type: "pkcs8",
            format: "pem",
        },
        publicKeyEncoding: {
            type: "spki",
            format: "pem",
        },
    });

    return { privateKey, publicKey };
}
