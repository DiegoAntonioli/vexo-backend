import { cleanEnv, str, port, makeValidator } from "envalid";
import "dotenv/config";

console.log({ env: process.env });

const notEmptyStr = makeValidator((input: string) => {
  if (typeof input !== "string" || input === "")
    throw new Error("Missing value");
  return input;
});

const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "production"],
  }),
  PORT: port(),
  DB_URI: notEmptyStr(),
  JWT_SECRET: notEmptyStr(),
  CHAT_JWT_SECRET: notEmptyStr(),
  CEL_CREDIT_AUTH_URL: notEmptyStr(),
  CEL_CREDIT_PLATAFORM_URL: notEmptyStr(),
  ORIGINATOR_ID: notEmptyStr(),
  ORIGINATOR_CREDENTIALS_ID: notEmptyStr(),
  ORIGINATOR_CREDENTIALS_SECRET: notEmptyStr(),
  FUNDING_ID: notEmptyStr(),
  FUNDING_CREDENTIALS_ID: notEmptyStr(),
  FUNDING_CREDENTIALS_SECRET: notEmptyStr(),
  PRODUCT_ID: notEmptyStr(),
  GALAX_ID: notEmptyStr(),
  GALAX_HASH: notEmptyStr(),
  CELCASH_URL: notEmptyStr(),
  CELCASH_CONFIRM_HASH: notEmptyStr(),
});

export { env };
