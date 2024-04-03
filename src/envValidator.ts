import { cleanEnv, str, port, url } from "envalid";

const env = cleanEnv(
  process.env,
  {
    NODE_ENV: str({
      choices: ["development", "production"],
    }),
    PORT: port(),
    DB_URI: url(),
    JWT_SECRET: str(),
  },
);

export { env };
