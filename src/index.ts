import express from "express";
import { generateCredentialResponse, generateCustomCredential } from "./services/generateCredentialResponse";

const app = express();
const port = process.env.PORT || 4000;

app.get("/generateCredential", async (_, res) => {
    const result = await generateCredentialResponse("mock_user");
    res.send(result);
});

app.use(express.json());

app.post("/generateCustomCredential", async (req, res) => {
    try {
        const body = req.body;

        if (Object.keys(body).length === 0) {
            res.json(await generateCredentialResponse("mock_user", body?.disclosureFrame));
        } else {
            res.json(await generateCustomCredential(body.creds, body?.disclosureFrame));
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to generate credential" });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
