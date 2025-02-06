import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createPublicKey } from "crypto";
import { holderDummyKeys } from "../services/generateDummyKeyPair";

const app = express();

interface ProofPayload {
    nonce: string;
    aud: string;
    iss: string;
    iat: number;
    // Add any additional claims here
}

declare global {
    namespace Express {
        interface Request {
            proof?: ProofPayload;
        }
    }
}

// Middleware to extract and verify the proof JWT
export function verifyProofJWT(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.substring("Bearer ".length);

    try {
        // Public key has to be known
        const publicKey = createPublicKey(holderDummyKeys.publicKey);
        const decoded = jwt.verify(token, publicKey, {
            algorithms: ["ES256"],
        }) as ProofPayload;

        // Attach the decoded payload to the request for downstream use
        req.proof = decoded;
        next();
    } catch (error: any) {
        console.error("Proof JWT verification failed:", error);
        return res.status(401).json({ error: "Invalid proof token" });
    }
}
