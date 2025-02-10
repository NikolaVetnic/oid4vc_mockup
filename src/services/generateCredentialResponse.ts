import { randomUUID } from "crypto";
import { diplomaEntry } from "../data/diplomaEntry";
import { VerifiableCredentialFormat } from "../types/oid4vci.types";
import { importPKCS8, SignJWT } from "jose";
import { issuerDummyRSAKeys } from "./generateDummyKeyPair";

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
    eqf_level: false, // No ability to hide
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
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiableCredential"],
        credentialSubject: diploma,
        issuanceDate: new Date().toISOString(),
        expirationDate: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(), // 1 year from now
        id: `urn:credential:diploma:${randomUUID()}`, // Unique identifier for the credential
    };

    /*
        Sign the payload with the issuer's private key. This will be us-
        ed to verify the presentation later.
    */
    const issuerPrivateRsaKey = await importPKCS8(
        issuerDummyRSAKeys.privateKey,
        "RS256"
    );

    const signedCredential = await new SignJWT(payload)
        .setProtectedHeader({ alg: "RS256" })
        .setIssuer("did:key:faculty-of-mathematics-dr-daniel-divjakovic")
        .setAudience("user-wallet")
        .setIssuedAt(new Date().getTime())
        .setExpirationTime("2h")
        .sign(issuerPrivateRsaKey);

    return {
        format: VerifiableCredentialFormat.VC_SD_JWT,
        credential: signedCredential,
    };
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
