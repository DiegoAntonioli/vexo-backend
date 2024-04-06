import swaggerAutogen from "swagger-autogen";

const swaggerDefinition = {
  info: {
    version: "1.0.0",
    title: "Vexo API Swagger Doc",
    description: "API for Vexo",
  },
  servers: [
    {
      url: "http://localhost",
      description: "",
    },
  ],
  tags: [
    {
      name: "Auth",
      description: "Auth Endpoints",
    },
  ],
  components: {
    schemas: {
      // error responses
      serverError: {
        message: "Internal Server Error",
        data: {
          err: {},
        },
      },
      emailAlreadyInUse: {
        message: "Email or CPF already in use",
        data: {},
      },
      invalidEmailOrPassword: {
        message: "Invalid email or password",
        data: {},
      },
      unauthorized: {
        message: "Unauthorized",
        data: {
          err: {},
        },
      },
      signupBody: {
        $email: "test@test.com",
        $password: "123456",
      },
      signupResponse: {
        $OK: "OK",
        $userId: "65f4b974c6ea7db8af6172fc",
      },
      loginBody: {
        $email: "admin@vexo.com",
        $password: "admin",
      },
      loginResponse: {
        $OK: "OK",
        $token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTQwODM0MjUsIl9pZCI6IjY1ZjQ4NDQ3MzkyN2ZlZGRkOTZhZjMxMSIsImlhdCI6MTcxMTQ5MTQyNX0.NWlOrFDAruzIh643x6odpw58F4HfMUq7hTlTADWgqNY",
      },
      refreshTokenResponse: {
        $OK: "OK",
        $newToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTQwODM0MjUsIl9pZCI6IjY1ZjQ4NDQ3MzkyN2ZlZGRkOTZhZjMxMSIsImlhdCI6MTcxMTQ5MTQyNX0.NWlOrFDAruzIh643x6odpw58F4HfMUq7hTlTADWgqNY",
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTQwOTI2MjQsIl9pZCI6IjY1ZjRiOTIwYzZlYTdkYjhhZjYxNzJmNCIsImlhdCI6MTcxMTUwMDYyNH0.p5e-YrCP3eNmDijhWAq09I30j-wTvCrYVGwqzQFo2CQ",
      },
    },
  },
};

const outputFile = "./swagger-output.json";
const routes = ["./routes/index.ts"];

swaggerAutogen({ openapi: "3.0.0" })(
  outputFile,
  routes,
  swaggerDefinition,
).then(async () => {
  await require("./app");
});
