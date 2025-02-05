import { randomUUID } from "crypto";
import { diplomaEntry } from "../../data/diplomaEntry";
import { id } from "../../data/id";
import { VerifiableCredentialFormat } from "../types/oid4vci.types";
import { issuerSigner } from "./issuerSigner";
import { metadata } from "../../data/metadata";
import { base64url } from "jose";
import { generateProofJWT } from "./jwtHelper";

// original: https://github.com/wwWallet/wallet-ecosystem/blob/master/wallet-enterprise-configurations/diploma-issuer/src/configuration/SupportedCredentialsConfiguration/EdiplomasBlueprintSdJwtVCDM.ts

export async function generateCredentialResponse(name: string): Promise<{
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
