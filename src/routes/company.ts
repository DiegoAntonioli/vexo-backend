// registerCompanyEmployees
import {
  cancelPaymentSlipHandler,
  createCompany,
  createPaymentSlipHandler,
  getCompany,
  getCompanyInstallmentsHandler,
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
  "/:companyName/validate-company",
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

companyRouter.get(
  "/:companyId/open-installments",
  verifyTokenHandler,
  getCompanyMiddleware,
  getCompanyInstallmentsHandler,
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

companyRouter.post(
  "/:companyId/payment-slip",
  verifyTokenHandler,
  getCompanyMiddleware,
  createPaymentSlipHandler,
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

companyRouter.delete(
  "/:companyId/payment-slip/:paymentSlipId",
  verifyTokenHandler,
  getCompanyMiddleware,
  cancelPaymentSlipHandler,
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
