import { randomUUID } from "crypto";
import { base64url } from "jose";
import { diplomaEntry } from "../../data/diplomaEntry";
import { id } from "../../data/id";
import { metadata } from "../../data/metadata";
import { VerifiableCredentialFormat } from "../types/oid4vci.types";
import { issuerSigner } from "./issuerSigner";
import { generateProofJWT } from "./jwtHelper";

// original: https://github.com/wwWallet/wallet-ecosystem/blob/master/wallet-enterprise-configurations/diploma-issuer/src/configuration/SupportedCredentialsConfiguration/EdiplomasBlueprintSdJwtVCDM.ts

export async function generateCredentialResponse(name: string,
    disclosureFrame: any = {
        family_name: true,
        given_name: true,
        title: true,
        grade: true,
        eqf_level: false, // no ability to hide
        graduation_date: true,
    }): Promise<{
        format: VerifiableCredentialFormat;
        credential: any;
    }> {
    const proofJwt = generateProofJWT(); // Issuer signs with his private key and holder's public key in order to make it possible for holder to unpack with private key.

    const payload = {
        cnf: {
            jwk: proofJwt.decoded.header.jwk,
        },
        vct: id,
        jti: `urn:credential:diploma:${randomUUID()}`,
        family_name: diplomaEntry.family_name,
        given_name: diplomaEntry.given_name,
        title: diplomaEntry.title,
        grade: String(diplomaEntry.grade),
        eqf_level: String(diplomaEntry.eqf_level),
        graduation_date: new Date(diplomaEntry.graduation_date).toISOString(),
        expiry_date: new Date(diplomaEntry.expiry_date).toISOString(),
    };

    const { jws } = await issuerSigner.sign(
        payload,
        {
            typ: "vc+sd-jwt",
            vctm: [base64url.encode(JSON.stringify(metadata))],
        },
        disclosureFrame
    );

    const response = {
        format: VerifiableCredentialFormat.VC_SD_JWT,
        credential: jws,
    };

    return response;
}

export async function generateCustomCredential(diplomaData: any, disclosureFrame: any): Promise<{
    format: VerifiableCredentialFormat;
    credential: any;
}> {
    const proofJwt = generateProofJWT();

    const payload: any = {
        cnf: {
            jwk: proofJwt.decoded.header.jwk,
        },
        vct: id,
        jti: `urn:credential:diploma:${randomUUID()}`,
    };

    if (diplomaData?.family_name) payload.family_name = diplomaData.family_name;
    if (diplomaData?.given_name) payload.given_name = diplomaData.given_name;
    if (diplomaData?.title) payload.title = diplomaData.title;
    if (diplomaData?.grade) payload.grade = String(diplomaData.grade);
    if (diplomaData?.eqf_level) payload.eqf_level = String(diplomaData.eqf_level);
    if (diplomaData?.graduation_date) {
        const gradDate = new Date(diplomaData.graduation_date);
        if (!isNaN(gradDate.getTime())) {
            payload.graduation_date = gradDate.toISOString();
        }
    }

    if (diplomaData?.expiry_date) {
        const expDate = new Date(diplomaData.expiry_date);
        if (!isNaN(expDate.getTime())) {
            payload.expiry_date = expDate.toISOString();
        }
    }

    const { jws } = await issuerSigner.sign(
        payload,
        {
            typ: "vc+sd-jwt",
            vctm: [base64url.encode(JSON.stringify(metadata))],
        },
        disclosureFrame
    );

    return {
        format: VerifiableCredentialFormat.VC_SD_JWT,
        credential: jws,
    };
}
