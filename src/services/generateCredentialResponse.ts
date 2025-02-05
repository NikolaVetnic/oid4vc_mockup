import { randomUUID } from "crypto";
import { base64url } from "jose";
import { diplomaEntry } from "../../data/diplomaEntry";
import { holderPublicKeyJwk } from "../../data/holderPublicKeyJwk";
import { id } from "../../data/id";
import { metadata } from "../../data/metadata";
import { VerifiableCredentialFormat } from "../types/oid4vci.types";
import { issuerSigner } from "./issuerSigner";

// original: https://github.com/wwWallet/wallet-ecosystem/blob/master/wallet-enterprise-configurations/diploma-issuer/src/configuration/SupportedCredentialsConfiguration/EdiplomasBlueprintSdJwtVCDM.ts

export async function generateCredentialResponse(name: string): Promise<{
    format: VerifiableCredentialFormat;
    credential: any;
}> {
    const payload = {
        cnf: {
            jwk: holderPublicKeyJwk,
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

    const disclosureFrame = {
        family_name: true,
        given_name: true,
        title: true,
        grade: true,
        eqf_level: false, // no ability to hide
        graduation_date: true,
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

export async function generateCustomCredential(diplomaData: any): Promise<{
    format: VerifiableCredentialFormat;
    credential: any;
}> {
    const payload: any = {
        cnf: {
            jwk: holderPublicKeyJwk,
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

    const disclosureFrame = {
        family_name: !!diplomaData?.family_name,
        given_name: !!diplomaData?.given_name,
        title: !!diplomaData?.title,
        grade: !!diplomaData?.grade,
        eqf_level: false,
        graduation_date: !!diplomaData?.graduation_date,
    };

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
