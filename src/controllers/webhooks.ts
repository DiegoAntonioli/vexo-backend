import { env } from "envValidator";
import { RequestHandler } from "express";
import { setWebhooks, celcashWebhooks } from "helpers/celcoin";
import { CustomError } from "utils/error";

export const setWebhooksHandler: RequestHandler = async (req, res, next) => {
  try {
    const responseData = await setWebhooks();

    res.status(201).json({
      OK: "OK",
      responseData,
    });
  } catch (err) {
    console.log({ err });
    next(err);
  }
};

export const webhooksHandler: RequestHandler = async (req, res, next) => {
  try {
    const { event, confirmHash, Transaction, Charge } = req.body;
    if (confirmHash !== env.CELCASH_CONFIRM_HASH) {
      throw new CustomError("Unauthorized", 401);
    }
    console.log({ event, confirmHash, Transaction, Charge });
    const result = await celcashWebhooks({
      event,
      transactionData: Transaction,
      charge: Charge,
    });
    console.log({ result });
    res.status(200);
  } catch (err) {
    console.log({ err });
    next(err);
  }
};
