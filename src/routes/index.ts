import express from "express";
import { companyRouter } from "./company";
import { authRouter } from "./auth";
import { userRouter } from "./user";
import {
  createPaymentSlip,
  getCelcashAccessToken,
  getCelcoinFundingAccessToken,
  getCelcoinOriginatorAccessToken,
  getCompanies,
  getOpenInstallments,
  getPeople,
  getSimulation,
  getSimulations,
  setWebhooks,
} from "helpers/celcoin";
import { celcashWebhooksRouter } from "./celcashWebhooks";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // const responseData = await setWebhooks();
    res.status(200).json({ OK: "OK" });
  } catch (err) {
    console.log({ err });
  }
});

router.use("/auth", authRouter);
router.use(
  "/company",
  companyRouter,
  /*
  #swagger.tags = ['Company']
  #swagger.responses[500] = {
    description: "Internal server error",
    content: {
      "application/json": {
        schema: {
          $ref: '#/components/schemas/serverErrorResponse'
        }
      }
    }
  }
  */
);
router.use(
  "/user",
  userRouter,
  /*
  #swagger.tags = ['User']
  #swagger.responses[500] = {
    description: "Internal server error",
    content: {
      "application/json": {
        schema: {
          $ref: '#/components/schemas/serverErrorResponse'
        }
      }
    }
  }
  */
);

router.use(
  "/webhook-galax-pay",
  celcashWebhooksRouter,
  /*
  #swagger.tags = ['User']
  #swagger.responses[500] = {
    description: "Internal server error",
    content: {
      "application/json": {
        schema: {
          $ref: '#/components/schemas/serverErrorResponse'
        }
      }
    }
  }
  */
);

export { router };
export default { router };
