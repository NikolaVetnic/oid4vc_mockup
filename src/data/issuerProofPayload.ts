// Payload, or Claims.
export const issuerProofPayload = {
    nonce: Math.random().toString(36).substring(2, 15),
    aud: "user-wallet",
    iss: "http://localhost",
    iat: Math.floor(Date.now() / 1000),
};
