import { generateKeyPairSync } from "crypto";

export function generateDummyKeys() {
    const { privateKey: issuerPrivateKey, publicKey: issuerPublicKey } =
        generateKeyPairSync("ec", {
            namedCurve: "prime256v1", // Or 'secp256k1', etc.
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
            },
            publicKeyEncoding: {
                type: "spki",
                format: "pem",
            },
        });

    /*
        Does the holder need both the EC and the RSA keys, or can I som-
        ehow derive them when needed from the same source?
    */
    const { privateKey: holderPrivateECKey, publicKey: holderPublicECKey } =
        generateKeyPairSync("ec", {
            namedCurve: "prime256v1",
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
            },
            publicKeyEncoding: {
                type: "spki",
                format: "pem",
            },
        });

    const { privateKey: holderPrivateRSAKey, publicKey: holderPublicRSAKey } =
        generateKeyPairSync("rsa", {
            modulusLength: 2048, // Key size in bits, increase for stronger security.
            publicKeyEncoding: {
                type: "spki", // Recommended for public keys in PEM format.
                format: "pem",
            },
            privateKeyEncoding: {
                type: "pkcs8", // This produces the "-----BEGIN PRIVATE KEY-----" header.
                format: "pem",
            },
        });

    const { privateKey: verifierPrivateKey, publicKey: verifierPublicKey } =
        generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: "spki",
                format: "pem",
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
            },
        });

    return {
        issuerPrivateKey,
        issuerPublicKey,
        holderPrivateECKey,
        holderPublicECKey,
        holderPrivateRSAKey,
        holderPublicRSAKey,
        verifierPrivateKey,
        verifierPublicKey,
    };
}

const dummyKeys = generateDummyKeys();

const issuerPrivateKey = dummyKeys.issuerPrivateKey;
const issuerPublicKey = dummyKeys.issuerPublicKey;

export const issuerDummyKeys = {
    privateKey: issuerPrivateKey,
    publicKey: issuerPublicKey,
};

const holderPrivateECKey = dummyKeys.holderPrivateECKey;
const holderPublicECKey = dummyKeys.holderPublicECKey;

export const holderDummyECKeys = {
    privateKey: holderPrivateECKey,
    publicKey: holderPublicECKey,
};

const holderPrivateRSAKey = dummyKeys.holderPrivateRSAKey;
const holderPublicRSAKey = dummyKeys.holderPublicRSAKey;

export const holderDummyRSAKeys = {
    privateKey: holderPrivateRSAKey,
    publicKey: holderPublicRSAKey,
};

const verifierPrivateKey = dummyKeys.verifierPrivateKey;
const verifierPublicKey = dummyKeys.verifierPublicKey;

export const verifierDummyKeys = {
    privateKey: verifierPrivateKey,
    publicKey: verifierPublicKey,
};
