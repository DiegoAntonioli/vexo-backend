import { RequestHandler } from "express";
import { Company, CompanyModel } from "models/company";
import { Document } from "mongoose";
import { CustomError } from "utils/error";

export const getCompanyMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const company = (await CompanyModel.findById(companyId)) as Company &
      Document;
    console.log({ companyId });
    if (!company) {
      throw new CustomError("Company not found", 404);
    }

    res.locals.company = company;
    next()
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
