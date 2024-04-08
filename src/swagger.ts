import swaggerAutogen from "swagger-autogen";

const swaggerDefinition = {
  info: {
    version: "1.0.0",
    title: "Vexo API Swagger Doc",
    description: "API for Vexo",
  },
  servers: [
    {
      url: "https://server.vexocred.com",
      description: "",
    },
  ],
  tags: [
    {
      name: "Auth",
      description: "Auth Endpoints",
    },
    {
      name: "Company",
      description: "Company Endpoints",
    },
    {
      name: "User",
      description: "User Endpoints",
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
      // user routes
      isUserRegisteredRes: {
        OK: "OK",
        isRegistered: true,
        emailVerified: false,
        phoneVerified: false,
        userId: "65f4b974c6ea7db8af6172fc",
      },
      validateUserBody: {
        email: "joao@hotmail.com",
      },
      validateUserRes: {
        OK: "OK",
        validated: true,
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTQwODM0MjUsIl9pZCI6IjY1ZjQ4NDQ3MzkyN2ZlZGRkOTZhZjMxMSIsImlhdCI6MTcxMTQ5MTQyNX0.NWlOrFDAruzIh643x6odpw58F4HfMUq7hTlTADWgqNY",
        isRegistered: true,
        hasEmploymentRelations: true,
        emailVerified: false,
        phoneVerified: false,
      },
      validateCompanyBody: {
        companyName: "Vtex",
      },
      validateCompanyRes: {
        OK: "OK",
        companyRegistered: true,
      },
      optInBody: {
        email: "joao@hotmail.com",
      },
      optInRes: {
        OK: "OK",
      },
      verifyEmailBody: {
        code: "1234",
      },
      verifyEmailRes: {
        OK: "OK",
      },
      patchPhoneBody: {
        phone: "551199999-9999",
      },
      patchPhoneRes: {
        OK: "OK",
      },
      verifyPhoneBody: {
        code: "1234",
      },
      verifyPhoneRes: {
        OK: "OK",
      },
      calculatorBody: {
        value: 1000000,
        installments: 12,
      },
      calculatorRes: {
        OK: "OK",
        simulations: [
          {
            value: 1000000,
            installmentValue: 180000,
            installments: 6,
          },
          {
            value: 1000000,
            installmentValue: 92000,
            installments: 12,
          },
          {
            value: 1000000,
            installmentValue: 62000,
            installments: 18,
          },
        ],
      },
      validateUserDataBody: {
        birthdate: "1990-01-01",
        postalCode: "1234000",
        street: "Avenida Pacaembu",
        addressNumber: "502",
        addressLine2: "ap21",
        neighborhood: "Pacaembu",
        city: "São Paulo",
        state: "SP",
      },
      validateUserDataRes: {
        OK: "OK",
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
