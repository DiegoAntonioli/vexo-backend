import express from "express";
import { companyRouter } from "./company";
import { authRouter } from "./auth";
import { userRouter } from "./user";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ OK: "OK" });
});

router.use("/auth", authRouter);
router.use(
  "/company",
  companyRouter
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
  userRouter
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
