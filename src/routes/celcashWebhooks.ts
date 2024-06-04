import { webhooksHandler } from "controllers/webhooks";
import express from "express";

const celcashWebhooksRouter = express.Router({ mergeParams: true });
// multipart/form-data

celcashWebhooksRouter.get("/", webhooksHandler);

export { celcashWebhooksRouter };
