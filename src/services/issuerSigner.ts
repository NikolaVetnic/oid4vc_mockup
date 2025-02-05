import "reflect-metadata";
import { config } from "../../config";
import { CredentialSigner } from "./interfaces";
import fs from "fs";
import path from "path";
import {
    HasherAlgorithm,
    HasherAndAlgorithm,
    SdJwt,
    SignatureAndEncryptionAlgorithm,
    Signer,
} from "@sd-jwt/core";
import { sign, randomBytes, createHash, KeyObject } from "crypto";
import { importPrivateKeyPem } from "../lib/importPrivateKeyPem";
import { calculateJwkThumbprint, exportJWK, importX509 } from "jose";
import { issuerDummyKeys } from "./generateDummyKeyPair";

const issuerX5C: string[] = JSON.parse(
    fs
        .readFileSync(path.join(__dirname, "../../keys/x5c.json"), "utf-8")
        .toString()
) as string[];

/*
    const issuerCertPem = fs
        .readFileSync(path.join(__dirname, "../../keys/pem.crt"), "utf-8")
        .toString() as string;

    importPrivateKeyPem(dummyKeyPair.privateKey, "ES256"); // attempt to import the key
    importX509(issuerCertPem, "ES256"); // attempt to import the public key
*/

export const issuerSigner: CredentialSigner = {
    sign: async function (payload, headers, disclosureFrame) {
        const key = await importPrivateKeyPem(
            issuerDummyKeys.privateKey,
            "ES256"
        );

        if (!key) {
            throw new Error("Could not import private key");
        }
        const signer: Signer = (input, header) => {
            if (header.alg !== SignatureAndEncryptionAlgorithm.ES256) {
                throw new Error("only ES256 is supported");
            }
            return sign(null, Buffer.from(input), {
                dsaEncoding: "ieee-p1363",
                key: key as KeyObject,
            });
        };

        const saltGenerator = () => {
            const buffer = randomBytes(16);
            return buffer
                .toString("base64")
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=/g, "");
        };

        const hasherAndAlgorithm: HasherAndAlgorithm = {
            hasher: (input: string) =>
                createHash("sha256").update(input).digest(),
            algorithm: HasherAlgorithm.Sha256,
        };

        const issuanceDate = new Date();

        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1); // set token expiration to one year

        payload.exp = Math.floor(expirationDate.getTime() / 1000);
        payload.iat = Math.floor(issuanceDate.getTime() / 1000);
        payload.iss = config.url;
        payload.sub = await calculateJwkThumbprint(payload.cnf.jwk);
        headers.x5c = issuerX5C;

        if (disclosureFrame != undefined) {
            const sdJwt = new SdJwt({
                header: {
                    ...headers,
                    alg: SignatureAndEncryptionAlgorithm.ES256,
                },
                payload,
            })
                .withHasher(hasherAndAlgorithm)
                .withSigner(signer)
                .withSaltGenerator(saltGenerator)
                .withDisclosureFrame(disclosureFrame);
            return { jws: await sdJwt.toCompact() };
        } else {
            throw new Error("Could not generate signature");
        }
    },
    getPublicKeyJwk: async function () {
        const key = await importPrivateKeyPem(
            issuerDummyKeys.privateKey,
            "ES256"
        );
        if (!key) {
            throw new Error("Could not import private key");
        }
        const jwk = await exportJWK(key);
        return { jwk: jwk };
    },
};
