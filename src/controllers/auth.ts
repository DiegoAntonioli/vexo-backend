import { RequestHandler } from "express";
import { compareSync } from "bcrypt";
import { sign } from "jsonwebtoken";

import { User, UserModel } from "models/user";
import { env } from "envValidator";
import { CustomError } from "utils/error";
import { Document } from "mongoose";

const login: RequestHandler = async (req, res, next) => {
  try {
    const { cpf, password } = req.body;

    const user = (await UserModel.findOne(
      { cpf },
      { cpf: 1, hashedPassword: 1 },
    )) as User & Document;
    console.log({ user });
    if (!user?.hashedPassword || typeof user.hashedPassword !== "string") {
      throw new CustomError("Invalid email or password", 401);
    }
    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTQ5Mzc3ODgsIl9pZCI6IjY2MTA1MjVhYjY0MDgyMmYxODU0ZDI3NyIsImlhdCI6MTcxMjM0NTc4OH0.TkGpPJlRFKcz_ebctfVXTnUNmGp7xgIkW701X12TtpI
    console.log(typeof user.hashedPassword);
    const result = compareSync(password, user.hashedPassword);

    if (!result) {
      throw new CustomError("Invalid email or password", 401);
    }

    const token = sign(
      {
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        userId: user._id,
      },
      env.JWT_SECRET,
    );

    res.status(201).json({ OK: "OK", token });
  } catch (err) {
    next(err);
  }
};

const refreshToken: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const newToken = sign(
      {
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        _id: userId,
      },
      env.JWT_SECRET,
    );
    res.status(201).json({ OK: "OK", newToken });
  } catch (err) {
    if (err instanceof Error) {
      const newError = new CustomError("Unauthorized", 401, { err });
      return next(newError);
    }
    next(err);
  }
};

export { login, refreshToken };
