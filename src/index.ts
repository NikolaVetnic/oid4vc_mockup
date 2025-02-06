import express from "express";
import { generateCredentialResponse } from "./services/generateCredentialResponse";

const app = express();
const port = process.env.PORT || 4000;

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
