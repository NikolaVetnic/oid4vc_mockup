import express from "express";
import { generateCredentialResponse } from "./services/generateCredentialResponse";
import { generateCustomCredential } from "./services/generateCustomCredentialResponse";

const app = express();
const port = process.env.PORT || 4000;

app.get("/generateCredential", async (_, res) => {
    const result = await generateCredentialResponse("mock_user");
    res.send(result);
});

app.use(express.json());

app.post("/generateCustomCredential", async (req, res) => {
    try {
        const diplomaData = req.body;

        const result = await generateCustomCredential(diplomaData);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to generate credential" });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
