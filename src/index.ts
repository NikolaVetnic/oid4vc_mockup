import express, { query } from "express";
import { generateCredentialResponse } from "./services/generateCredentialResponse";

const app = express();
const port = process.env.PORT || 4000;

app.get("/generateCredential", async (_, res) => {
    const result = await generateCredentialResponse("mock_user");
    res.send(result);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
