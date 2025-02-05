import { generateKeyPairSync } from "crypto";

export function generateDummyKeys() {
    const { privateKey: issuerPrivateKey, publicKey: issuerPublicKey } =
        generateKeyPairSync("ec", {
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

    const { privateKey: holderPrivateKey, publicKey: holderPublicKey } =
        generateKeyPairSync("ec", {
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

    return {
        issuerPrivateKey,
        issuerPublicKey,
        holderPrivateKey,
        holderPublicKey,
    };
}

const dummyKeys = generateDummyKeys();

const issuerPrivateKey = dummyKeys.issuerPrivateKey;
const issuerPublicKey = dummyKeys.issuerPublicKey;

const holderPrivateKey = dummyKeys.holderPrivateKey;
const holderPublicKey = dummyKeys.holderPublicKey;

export const issuerDummyKeys = {
    privateKey: issuerPrivateKey,
    publicKey: issuerPublicKey,
};
export const holderDummyKeys = {
    privateKey: holderPrivateKey,
    publicKey: holderPublicKey,
};
