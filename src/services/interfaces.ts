import { JWK } from "jose";

export interface CredentialSigner {
    sign(
        payload: any,
        headers?: any,
        disclosureFrame?: any
    ): Promise<{ jws: string }>;
    getPublicKeyJwk(): Promise<{ jwk: JWK }>;
}

export interface CredentialOffer {
    issuer: string;
    credentialType: string;
    offerUrl: string;
}
