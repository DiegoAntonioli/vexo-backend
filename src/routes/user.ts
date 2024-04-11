import express, { RequestHandler } from "express";

import {
  calculator,
  isUserRegistered,
  optIn,
  patchPhone,
  validateUser,
  validateUserData,
  verifyEmail,
  verifyPhone,
} from "controllers/user";
import { Document } from "mongoose";
import { User } from "models/user";
import { verifyChatTokenHandler } from "middlewares/auth";

const userRouter = express.Router();

userRouter.get(
  "/:userCPF/isRegistered",
  isUserRegistered,
  /*
  #swagger.parameters['userCPF'] = {
    in: "path",
    required: true
  }
  #swagger.responses[201] = {
    description: "Success",
    content: {
      "application/json": {
        schema: {
          $ref: '#/components/schemas/isUserRegisteredRes'
        }
      }
    }
  }
  */
);

userRouter.post(
  "/:userCPF/validate-user",
  validateUser,
  /*
  #swagger.parameters['userCPF'] = {
    in: "path",
    required: true
  }
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/validateUserBody"
        }  
      }
    }
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

userRouter.put(
  "/:userCPF/email",
  optIn,
  /*
  #swagger.parameters['userCPF'] = {
    in: "path",
    required: true
  }
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/optInBody"
        }  
      }
    }
  }
  #swagger.responses[201] = {
    description: "Success",
    content: {
      "application/json": {
        schema: {
          $ref: '#/components/schemas/optInRes'
        }
      }
    }
  }
  */
);

userRouter.put(
  "/:userCPF/verify-email",
  verifyChatTokenHandler,
  verifyEmail,
  /*
  #swagger.security = [{
    "bearerAuth": []
  }]
  #swagger.parameters['userCPF'] = {
    in: "path",
    required: true
  }
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/verifyEmailBody"
        }  
      }
    }
  }
  #swagger.responses[201] = {
    description: "Success",
    content: {
      "application/json": {
        schema: {
          $ref: '#/components/schemas/verifyEmailRes'
        }
      }
    }
  }
  */
);

userRouter.put(
  "/:userCPF/phone",
  verifyChatTokenHandler,
  patchPhone,
  /*
  #swagger.security = [{
    "bearerAuth": []
  }]
  #swagger.parameters['userCPF'] = {
    in: "path",
    required: true
  }
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/patchPhoneBody"
        }  
      }
    }
  }
  #swagger.responses[201] = {
    description: "Success",
    content: {
      "application/json": {
        schema: {
          $ref: '#/components/schemas/patchPhoneRes'
        }
      }
    }
  }
  */
);

userRouter.put(
  "/:userCPF/verify-phone",
  verifyChatTokenHandler,
  verifyPhone,
  /*
  #swagger.security = [{
    "bearerAuth": []
  }]
  #swagger.parameters['userCPF'] = {
    in: "path",
    required: true
  }
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/verifyPhoneBody"
        }  
      }
    }
  }
  #swagger.responses[201] = {
    description: "Success",
    content: {
      "application/json": {
        schema: {
          $ref: '#/components/schemas/verifyPhoneRes'
        }
      }
    }
  }
  */
);

userRouter.post(
  "/:userCPF/simulation",
  verifyChatTokenHandler,
  calculator,
  /*
  #swagger.security = [{
    "bearerAuth": []
  }]
  #swagger.parameters['userCPF'] = {
    in: "path",
    required: true
  }
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/calculatorBody"
        }  
      }
    }
  }
  #swagger.responses[201] = {
    description: "Success",
    content: {
      "application/json": {
        schema: {
          $ref: '#/components/schemas/calculatorRes'
        }
      }
    }
  }
  */
);

userRouter.post(
  "/:userCPF/verify-user",
  verifyChatTokenHandler,
  validateUserData,
  /*
  #swagger.security = [{
    "bearerAuth": []
  }]
  #swagger.parameters['userCPF'] = {
    in: "path",
    required: true
  }
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/validateUserDataBody"
        }  
      }
    }
  }
  #swagger.responses[201] = {
    description: "Success",
    content: {
      "application/json": {
        schema: {
          $ref: '#/components/schemas/validateUserDataRes'
        }
      }
    }
  }
  */
);

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
