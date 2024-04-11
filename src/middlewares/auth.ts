import { env } from "envValidator";
import { RequestHandler } from "express";
import { verify } from "jsonwebtoken";
import { User, UserModel } from "models/user";
import { Document } from "mongoose";
import { CustomError } from "utils/error";

export const verifyTokenHandler: RequestHandler = async (req, res, next) => {
  try {
    if (!req.headers["authorization"]) {
      throw new CustomError("Unauthorized", 401);
    }
    const token = req.headers["authorization"].replace("Bearer ", "");
    const decodedToken = verify(token, env.JWT_SECRET);
    if (typeof decodedToken === "string") {
      throw new CustomError();
    }

    console.log({ decodedToken });

    const user = (await UserModel.findById(decodedToken.userId)) as User &
      Document;
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    res.locals.user = user;
    next();
  } catch (err) {
    if (err instanceof CustomError) {
      return next(err);
    }
    if (err instanceof Error) {
      const newError = new CustomError("Unauthorized", 401, { err });
      return next(newError);
    }
    next(err);
  }
};

export const verifyChatTokenHandler: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    if (!req.headers["authorization"]) {
      throw new CustomError("Unauthorized", 401);
    }
    const token = req.headers["authorization"].replace("Bearer ", "");
    const decodedToken = verify(token, env.CHAT_JWT_SECRET);
    console.log({ decodedToken, token });
    if (typeof decodedToken === "string") {
      throw new CustomError();
    }

    console.log({ decodedToken });

    const user = (await UserModel.findById(decodedToken.userId)) as User &
      Document;
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    const { userCPF } = req.params;
    console.log({ userCPF, cpf: user.cpf });
    if (user.cpf !== userCPF) {
      throw new CustomError("Unauthorized", 401);
    }

    res.locals.user = user;
    res.locals.hasEmploymentRelations = decodedToken.hasEmploymentRelations;
    next();
  } catch (err) {
    if (err instanceof CustomError) {
      return next(err);
    }
    if (err instanceof Error) {
      const newError = new CustomError("Unauthorized", 401, { err });
      return next(newError);
    }
    next(err);
  }
};

export const hasEmploymentRelation: RequestHandler = async (req, res, next) => {
  try {
    if (!res.locals.hasEmploymentRelations)
      throw new CustomError("User don't have employment relations", 401);
    next();
  } catch (err) {
    if (err instanceof CustomError) {
      return next(err);
    }
    if (err instanceof Error) {
      const newError = new CustomError("Unauthorized", 401, { err });
      return next(newError);
    }
    next(err);
  }
};
