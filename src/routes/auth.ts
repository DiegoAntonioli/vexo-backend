import express from "express";

import { login, refreshToken } from "controllers/auth";
import { verifyTokenHandler } from "middlewares/auth";

const authRouter = express.Router();

authRouter.post("/login", login);

authRouter.post("/token", verifyTokenHandler, refreshToken);

export { authRouter };
