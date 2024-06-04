import path from "path";
import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerFile from "swagger-output.json";
import helmet from "helmet";
import { router } from "routes";

const app = express();
app.use(helmet());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/public", express.static(path.join(__dirname, "..", "public")));

app.use(((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, Authorization",
  );
  next();
}) as express.RequestHandler);

app.use("/", router);

// eslint-disable-next-line
app.use(((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  const data = error.data;
  res.status(status).json({ message: message, data: data });
}) as express.ErrorRequestHandler);

// app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

export default app;
