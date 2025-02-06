import express from "express";
import { generateCredentialResponse } from "./services/generateCredentialResponse";

const app = express();
const port = process.env.PORT || 4000;
/*
    The holder (or their client) generates a proof JWT that demonst-
    rates control of their private key. This is usually obtained via
    a POST request to a dedicated endpoint (or generated within a w-
    allet app) and then sent in the Authorization header of subsequ-
    ent requests.
*/
app.post(`${vciPrefix}/generateHolderProof`, async (req, res) => {
    try {
        const { iss } = req.body; // Expecting the client to provide the holder identifier (iss)

        if (!iss)
            return res
                .status(400)
                .json({ error: "Holder identifier (iss) is required" });

        const payload = {
            nonce: Math.random().toString(36).substring(2, 15),
            aud: `http://localhost:${port}/generateCredential`,
            iss,
            iat: Math.floor(Date.now() / 1000),
        };

        const { token, decoded } = generateProofJWT(
            payload,
            holderDummyKeys.publicKey,
            holderDummyKeys.privateKey
        );

        res.json({ token, decoded });
    } catch (error: any) {
        console.error("Error generating holder proof JWT:", error);
        res.status(500).json({
            error: error.message || "Failed to generate holder proof JWT",
        });
    }
});

/*
    In production, the proof JWT of the holder is provided by the c-
    The issuer publishes or serves a credential offer—often present-
    ed as a QR code or a URL. The offer provides key details like t-
    he URL for requesting the credential, as well as the instructio-
    ns for the holder on how to proceed.
    In a real-world scenario, the offer might include additional me-
    tadata or security parameters.
    Use ../qr-viewer.html to view the generated QR code.
*/
app.get(`${vciPrefix}/getCredentialOffer`, async (_, res) => {
    try {
        // Example offer details
        const offer: CredentialOffer = {
            issuer: `http://localhost:${port}`,
            credentialType: "Diploma",
            // The URL where the holder can initiate the credential issuance process.
            // This might include a unique offer identifier in a production setup.
            offerUrl:
                "https://my-issuer.com/credential-request?offerId=123456789",
        };

        // Generate a QR code from the offer URL
        const qrCodeDataUrl = await toDataURL(offer.offerUrl);

        // Return the offer and the QR code as a JSON response.
        // The client can render the QR code image from the data URL.
        res.json({
            offer,
            qrCode: qrCodeDataUrl,
        });
    } catch (error) {
        console.error("Error generating credential offer:", error);
        res.status(500).json({ error: "Failed to generate credential offer" });
    }
});
    res.send(result);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
