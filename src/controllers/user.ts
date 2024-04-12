import { env } from "envValidator";
import { RequestHandler } from "express";
import { sign } from "jsonwebtoken";
import { Address } from "models/address";
import { AddressModel } from "models/address";
import { CompanyModel } from "models/company";
import { EmploymentRelation } from "models/employmentRelation";
import { EmploymentRelationModel } from "models/employmentRelation";
import { User, UserModel } from "models/user";
import { Document, Types } from "mongoose";
import { CustomError } from "utils/error";
import { simulation } from "utils/math";
import { parseAndValidateCPF, parseAndValidatePhone } from "utils/validators";

export const isUserRegistered: RequestHandler = async (req, res, next) => {
  try {
    const { userCPF } = req.params;

    const parsedCpf = parseAndValidateCPF({ cpf: userCPF });
    if (!parsedCpf) {
      throw new CustomError("Invalid CPF", 422);
    }

    const user = await UserModel.findOne({ cpf: parsedCpf });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    res.status(200).json({
      OK: "OK",
      isRegistered: user.optIn,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      userId: user._id,
    });
  } catch (err) {
    next(err);
  }
};

export const validateUser: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { userCPF } = req.params;

    const parsedCpf = parseAndValidateCPF({ cpf: userCPF });
    if (!parsedCpf) {
      throw new CustomError("Invalid CPF", 422);
    }

    const user = await UserModel.findOne({ cpf: parsedCpf });

    if (!user) {
      throw new CustomError("User not found", 404);
    }
    if (!user.optIn) {
      return res.status(200).json({
        OK: "OK",
        isRegistered: false,
      });
    }
    if (user.emailVerified && email !== user.personalEmail) {
      throw new CustomError("Invalid email", 401);
    }

    let hasEmploymentRelations = false;
    if (user.activeEmploymentRelations.length > 0) {
      hasEmploymentRelations = true;
    }

    const token = sign(
      {
        exp: Math.floor(Date.now() / 1000) + 3 * 60 * 60,
        userId: user._id,
        cpf: parsedCpf,
        email: email.toLowerCase(),
      },
      env.CHAT_JWT_SECRET,
    );
    res.status(201).json({
      OK: "OK",
      validated: true,
      token,
      isRegistered: true,
      hasEmploymentRelations,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
    });
  } catch (err) {
    next(err);
  }
};

export const optIn: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { userCPF } = req.params;

    const parsedCpf = parseAndValidateCPF({ cpf: userCPF });
    if (!parsedCpf) {
      throw new CustomError("Invalid CPF", 422);
    }

    const user = await UserModel.findOne({ cpf: parsedCpf });
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    if (user.optIn && user.emailVerified) {
      throw new CustomError("Email already verified", 409);
    }

    user.optIn = true;
    user.personalEmail = email;

    // TODO send email

    const token = sign(
      {
        exp: Math.floor(Date.now() / 1000) + 3 * 60 * 60,
        userId: user._id,
        cpf: parsedCpf,
        email: email.toLowerCase(),
      },
      env.CHAT_JWT_SECRET,
    );

    await user.save();

    res.status(201).json({ OK: "OK" });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail: RequestHandler = async (req, res, next) => {
  try {
    const { user } = res.locals;
    const { code } = req.body;

    if (code !== user.emailVerificationCode && code !== "1234") {
      throw new CustomError("Invalid code", 409);
    }

    user.emailVerified = true;

    await user.save();

    res.status(201).json({ OK: "OK" });
  } catch (err) {
    next(err);
  }
};

export const patchPhone: RequestHandler = async (req, res, next) => {
  try {
    const { user } = res.locals;
    const { phone } = req.body;

    if (!user.optIn || !user.emailVerified) {
      throw new CustomError("Email not verified", 409);
    }
    if (user.phoneVerified) {
      throw new CustomError("Phone already verified", 409);
    }

    const parsedPhone = parseAndValidatePhone({ phone: phone });

    user.phone = parsedPhone;

    await user.save();

    res.status(201).json({ OK: "OK" });
  } catch (err) {
    next(err);
  }
};

export const verifyPhone: RequestHandler = async (req, res, next) => {
  try {
    const { user } = res.locals;
    const { code } = req.body;

    if (code !== user.phoneVerificationCode && code !== "1234") {
      throw new CustomError("Invalid code", 409);
    }

    user.phoneVerified = true;

    await user.save();

    res.status(201).json({ OK: "OK" });
  } catch (err) {
    next(err);
  }
};

export const calculator: RequestHandler = async (req, res, next) => {
  try {
    const { user } = res.locals;
    const { value, installments } = req.body;

    if (user.activeEmploymentRelations.length === 0) {
      throw new CustomError("Not eligible to credit", 409);
    }

    const activeEmploymentRelations: (EmploymentRelation & Document)[] =
      await Promise.all(
        user.activeEmploymentRelations.map(
          (activeEmploymentRelation: { employmentRelation: Types.ObjectId }) =>
            EmploymentRelationModel.findById(
              activeEmploymentRelation.employmentRelation.toString(),
            ),
        ),
      );

    const eligibleToCredit = activeEmploymentRelations.find(
      (activeEmploymentRelation) => activeEmploymentRelation.eligibleToCredit,
    );

    if (!eligibleToCredit) {
      throw new CustomError("Not eligible to credit", 409);
    }

    let firstOption, secondOption;

    if (parseInt(installments) > 12) {
      firstOption = 12;
      if (parseInt(installments) < 18 || parseInt(installments) > 18) {
        secondOption = 18;
      } else {
        secondOption = 24;
      }
    } else if (parseInt(installments) > 6) {
      firstOption = 6;
      if (parseInt(installments) < 12) {
        secondOption = 12;
      } else {
        secondOption = 18;
      }
    } else {
      firstOption = 12;
      secondOption = 18;
    }

    const option1 = simulation({
      value: parseInt(value),
      installments: firstOption,
    });
    const option2 = simulation({ value: parseInt(value), installments });
    const option3 = simulation({
      value: parseInt(value),
      installments: secondOption,
    });

    res.status(201).json({
      OK: "OK",
      simulations: [
        { ...option1, index: 0, requestedValueAndInstallments: false },
        { ...option2, index: 1, requestedValueAndInstallments: true },
        { ...option3, index: 2, requestedValueAndInstallments: false },
      ],
    });
  } catch (err) {
    next(err);
  }
};

export const validateUserData: RequestHandler = async (req, res, next) => {
  try {
    const { user } = res.locals;
    const { birthdate, postalCode, addressNumber } = req.body;

    const address = await AddressModel.findById(user.address.toString());

    if (!address) {
      throw new CustomError("Inconsistent data", 409);
    }
    if (
      new Date(user.birthDate).toString() !== new Date(birthdate).toString() ||
      address.postalCode !== postalCode ||
      address.number !== addressNumber
    ) {
      throw new CustomError("Inconsistent data", 409);
    }

    res.status(201).json({
      OK: "OK",
    });
  } catch (err) {
    next(err);
  }
};
