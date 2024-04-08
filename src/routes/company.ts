// registerCompanyEmployees
import {
  createCompany,
  getCompany,
  registerCompanyEmployees,
  validateCompany,
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

companyRouter.get(
  "/:userId/validate-company",
  validateCompany,
  /*
  #swagger.parameters['companyName'] = {
    in: "path",
    required: true
  }
  #swagger.responses[201] = {
    description: "Success",
    content: {
      "application/json": {
        schema: {
          $ref: '#/components/schemas/validateUserRes'
        }
      }
    }
  }
  */
);

export { companyRouter };
