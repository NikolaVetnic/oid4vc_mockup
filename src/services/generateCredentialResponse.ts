import { randomUUID } from "crypto";
import { diplomaEntry } from "../data/diplomaEntry";
import { id } from "../data/id";
import { VerifiableCredentialFormat } from "../types/oid4vci.types";
import { issuerSigner } from "./issuerSigner";
import { metadata } from "../data/metadata";
import { base64url } from "jose";
import { generateProofJWT } from "./jwtHelper";
import { issuerProofPayload } from "../data/issuerProofPayload";
import { issuerDummyKeys } from "./generateDummyKeyPair";

// original: https://github.com/wwWallet/wallet-ecosystem/blob/master/wallet-enterprise-configurations/diploma-issuer/src/configuration/SupportedCredentialsConfiguration/EdiplomasBlueprintSdJwtVCDM.ts

const defaultDiploma = {
    family_name: diplomaEntry.family_name,
    given_name: diplomaEntry.given_name,
    title: diplomaEntry.title,
    grade: String(diplomaEntry.grade),
    eqf_level: String(diplomaEntry.eqf_level),
    graduation_date: new Date(diplomaEntry.graduation_date).toISOString(),
    expiry_date: new Date(diplomaEntry.expiry_date).toISOString(),
};

const defaultDisclosureFrame = {
    family_name: true,
    given_name: true,
    title: true,
    grade: true,
    eqf_level: false, // no ability to hide
    graduation_date: true,
    expiry_date: true,
};

export async function generateCredentials(
    inputDiploma?: any,
    inputDisclosureFrame?: any
): Promise<{
    format: VerifiableCredentialFormat;
    credential: any;
}> {
    const issuerProofJwt = generateProofJWT(
        issuerProofPayload,
        issuerDummyKeys.publicKey,
        issuerDummyKeys.privateKey
    ); // Issuer signs with his private key and holder's public key in order to make it possible for holder to unpack with private key.

    const diploma = inputDiploma ?? defaultDiploma;
    const disclosureFrame = inputDisclosureFrame ?? defaultDisclosureFrame;

    /*
        VCI spec defines the option of binding the credentials to the u-
        ser to which they belong (which would in turn allow each user to
        use a different proof for each credential, therefor achieving t-
        otal anonimity) for which the holder's public key would be used.
        As this is optional, we have opted not to implement it.
     */

    validateDisclosureFrame(diploma, disclosureFrame);

    const payload = {
        cnf: {
            jwk: issuerProofJwt.decoded.header.jwk,
        },
        vct: id,
        jti: `urn:credential:diploma:${randomUUID()}`,
        ...diploma,
    };

    const { jws } = await issuerSigner.sign(
        payload,
        {
            typ: "vc+sd-jwt",
            vctm: [base64url.encode(JSON.stringify(metadata))], // Metadata is currently not updated in accordance with the request payload.
        },
        disclosureFrame
    );

    const response = {
        format: VerifiableCredentialFormat.VC_SD_JWT,
        credential: jws,
    };

    return response;
}

function validateDisclosureFrame(diploma: any, disclosureFrame: any) {
    const missingKeys = Object.keys(diploma).filter(
        (key) => !(key in disclosureFrame)
    );

    if (missingKeys.length > 0) {
        throw new Error(
            `The following keys are missing in the disclosure frame: ${missingKeys.join(
                ", "
            )}`
        );
    }
}
