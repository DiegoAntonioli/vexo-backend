import express, { RequestHandler } from "express";

import {
  calculator,
  isUserRegistered,
  optIn,
  patchPhone,
  validateCompany,
  validateUser,
  validateUserData,
  verifyEmail,
  verifyPhone,
} from "controllers/user";
import { Document } from "mongoose";
import { User } from "models/user";

const userRouter = express.Router();

userRouter.get("/:userCPF/isRegistered", isUserRegistered);

userRouter.post("/:userId/validate-user", validateUser);

userRouter.get("/:userId/validate-company", validateCompany);

userRouter.patch("/:userId/email", optIn);

userRouter.patch("/:userId/verify-email", verifyEmail);

userRouter.patch("/:userId/phone", patchPhone);

userRouter.patch("/:userId/verify-phone", verifyPhone);

userRouter.get("/:userId/simulation", calculator);

userRouter.patch("/:userId", validateUserData);

interface IResLocals {
  user: User & Document;
}

interface OptInResBody {
  OK: string;
}

interface OptInReqBody {
  cpf: string;
  email: string;
}

export type OptInRequestHandler = RequestHandler<
  Record<string, never>,
  OptInResBody,
  OptInReqBody,
  Record<string, never>,
  IResLocals
>;

export { userRouter };
