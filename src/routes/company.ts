// registerCompanyEmployees
import {
  createCompany,
  getCompany,
  registerCompanyEmployees,
} from "controllers/company";
import express from "express";
import { verifyTokenHandler } from "middlewares/auth";
import { getCompanyMiddleware } from "middlewares/company";

const companyRouter = express.Router({ mergeParams: true });
// multipart/form-data
companyRouter.post("/", verifyTokenHandler, createCompany);

companyRouter.get(
  "/:companyId",
  verifyTokenHandler,
  getCompanyMiddleware,
  getCompany,
);

companyRouter.post(
  "/:companyId/addEmployees",
  verifyTokenHandler,
  getCompanyMiddleware,
  registerCompanyEmployees,
);

export { companyRouter };
