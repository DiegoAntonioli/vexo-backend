import mongoose from "mongoose";

import app from "./server";

import { env } from "./envValidator";
import { createAdmin } from "./utils/admin";

mongoose.connect(env.DB_URI).then(async () => {
  console.log({ env });
  console.log("DB Connected!");
  await createAdmin();
  app.listen(env.PORT || 8000);
  console.log(`Server listenning on PORT ${env.PORT || 8000}`);
});
