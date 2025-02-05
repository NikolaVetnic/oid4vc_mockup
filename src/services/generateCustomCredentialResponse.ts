import { randomUUID } from "crypto";
import { base64url } from "jose";
import { holderPublicKeyJwk } from "../../data/holderPublicKeyJwk";
import { id } from "../../data/id";
import { metadata } from "../../data/metadata";
import { VerifiableCredentialFormat } from "../types/oid4vci.types";
import { issuerSigner } from "./issuerSigner";

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
