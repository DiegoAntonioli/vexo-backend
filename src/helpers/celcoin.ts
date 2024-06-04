import { env } from "envValidator";
import { CompanyModel, IPopulatedAddressCompany } from "models/company";
import { CustomError } from "utils/error";
import { Document as MongooseDocument } from "mongoose";
import { IPopulatedAddressUser, UserModel } from "models/user";
import { RoleModel } from "models/role";
import {
  EmploymentRelationModel,
  IEmploymentRelation,
} from "models/employmentRelation";
import { newCaclIOF, newCalculateIntallmentAndTotalValues } from "./calculator";
import { createEmploymentRelation } from "controllers/company";
import { LoanAgreement, LoanAgreementModel } from "models/loanAgreement";
import {
  IPopulatedInstallment,
  Installment,
  InstallmentModel,
  InstallmentStatus,
} from "models/installment";
import { AccountModel } from "models/account";
import {
  PaymentSlip,
  PaymentSlipModel,
  PaymentSlipStatus,
} from "models/paymentSlip";
import { TransactionModel } from "models/transaction";

const ISPB_CODES = {
  654: 92874270,
  246: 28195667,
  75: 3532415,
  25: 3323840,
  213: 54403563,
  19: 9391857,
  740: 61146577,
  107: 15114366,
  96: 997185,
  318: 61186680,
  752: 1522368,
  248: 33485541,
  218: 71027866,
  65: 48795256,
  63: 4184779,
  237: 60746948,
  36: 60746948,
  204: 59438325,
  394: 7207996,
  208: 30306294,
  263: 33349358,
  473: 33466988,
  412: 15173776,
  40: 3609817,
  266: 33132044,
  739: 558456,
  233: 62421979,
  745: 33479023,
  241: 31597552,
  756: 2038232,
  748: 1181521,
  222: 75647891,
  505: 32062580,
  3: 4902979,
  83: 10690848,
  707: 62232889,
  300: 33042151,
  495: 44189447,
  494: 51938876,
  456: 60498557,
  214: 61199881,
  1: 0,
  47: 13009717,
  37: 4913711,
  41: 92702067,
  4: 7237373,
  265: 33644196,
  224: 58616418,
  626: 61348538,
  121: 10664513,
  612: 31880826,
  604: 31895683,
  320: 7450604,
  653: 61024352,
  630: 58497702,
  77: 416968,
  249: 61182408,
  184: 17298092,
  652: 60872504,
  74: 3017677,
  376: 33172537,
  217: 91884981,
  76: 7656500,
  757: 2318507,
  600: 59118133,
  243: 33923798,
  389: 17184037,
  370: 61088183,
  746: 30723886,
  66: 2801938,
  212: 92894922,
  79: 9516419,
  623: 59285411,
  611: 61820817,
  613: 60850229,
  94: 11758741,
  643: 62144175,
  735: 253448,
  747: 1023570,
  88: 11476673,
  633: 68900810,
  741: 517645,
  120: 33603457,
  422: 58160789,
  33: 90400888,
  743: 795423,
  366: 61533584,
  637: 60889128,
  464: 60518222,
  82: 7679404,
  634: 17351180,
  655: 59588111,
  610: 78626983,
  119: 13720915,
  124: 15357060,
  21: 28127603,
  719: 33884941,
  755: 62073200,
  250: 50585090,
  78: 34111187,
  18: 57839805,
  17: 42272526,
  69: 61033106,
  122: 33147315,
  125: 45246410,
  70: 208,
  92: 12865507,
  104: 360305,
  10: 81723108,
  112: 4243780,
  136: 315557,
  84: 2398976,
  114: 5790149,
  477: 33042953,
  90: 73085573,
  97: 4632856,
  85: 5463212,
  89: 62109566,
  98: 78157146,
  487: 62331228,
  62: 3012230,
  399: 1701201,
  132: 17453575,
  492: 49336860,
  341: 60701190,
  753: 74828799,
  254: 14388334,
  751: 29030467,
  91: 1634601,
  87: 543968,
  99: 3046391,
};

export const getCelcoinOriginatorAccessToken = async () => {
  const authString = Buffer.from(
    `${env.ORIGINATOR_CREDENTIALS_ID}:${env.ORIGINATOR_CREDENTIALS_SECRET}`,
  ).toString("base64");

  const responseData = await fetch(`${env.CEL_CREDIT_AUTH_URL}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Authorization: `Basic ${authString}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });
  const parsedResponseData = (await responseData.json()) as {
    access_token: string;
    expires_in: number;
    token_type: string;
  };
  console.log({ parsedResponseData1: parsedResponseData });
  return parsedResponseData.access_token;
};

export const getCelcoinFundingAccessToken = async () => {
  const authString = Buffer.from(
    `${env.FUNDING_CREDENTIALS_ID}:${env.FUNDING_CREDENTIALS_SECRET}`,
  ).toString("base64");

  const responseData = await fetch(`${env.CEL_CREDIT_AUTH_URL}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Authorization: `Basic ${authString}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });
  const parsedResponseData = (await responseData.json()) as {
    access_token: string;
    expires_in: number;
    token_type: string;
  };
  console.log({ parsedResponseData2: parsedResponseData });

  return parsedResponseData.access_token;
};

export const createAccountPJ = async ({ companyId }: { companyId: string }) => {
  const company: (IPopulatedAddressCompany & MongooseDocument) | null =
    await CompanyModel.findById(companyId);
  if (!company) throw new CustomError("Company not found", 404);

  console.log({ company });

  await company.populate("address");

  const authToken = await getCelcoinOriginatorAccessToken();

  const responseData = await fetch(
    `${env.CEL_CREDIT_PLATAFORM_URL}/banking/originator/business`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        phone: {
          country_code: company.phone.slice(1, 3),
          area_code: company.phone.slice(3, 5),
          number: company.phone.slice(5),
        },
        address: {
          street_name: company.address.street,
          street_number: company.address.number,
          district: company.address.neighborhood,
          postal_code: company.address.postalCode,
          city: company.address.city,
          state_code: company.address.state,
          country_code: "bra",
        },
        pix: {
          key_type: company.pix.keyType ? company.pix.keyType : "TAXPAYER_ID",
          key: company.pix.key ? company.pix.key : company.cnpj,
        },
        qualification_request: {
          product: {
            id: env.PRODUCT_ID,
          },
          funding: {
            id: env.FUNDING_ID,
          },
          role: "EMPLOYER",
        },
        billing_address: {
          street_name: company.address.street,
          street_number: company.address.number,
          district: company.address.neighborhood,
          postal_code: company.address.postalCode,
          city: company.address.city,
          state_code: company.address.state,
          country_code: "bra",
        },
        legal_name: company.name,
        taxpayer_id: company.cnpj,
      }),
    },
  );
  console.log({ responseData });
  const parsedResponseData = (await responseData.json()) as { id: string };
  console.log({ parsedResponseData3: parsedResponseData });

  company.celcoinAccountId = parsedResponseData.id;
  return company.save();
};

export const createAccountPF = async ({
  userId,
  companyId,
}: {
  userId: string;
  companyId: string;
}) => {
  const user: (IPopulatedAddressUser & MongooseDocument) | null =
    await UserModel.findById(userId);
  let company: (IPopulatedAddressCompany & MongooseDocument) | null =
    await CompanyModel.findById(companyId);
  if (!company) throw new CustomError("Company not found", 404);
  if (!user) throw new CustomError("User not found", 404);
  if (!user.activeEmploymentRelations[0])
    throw new CustomError("No active employment relation", 409);
  const employmentRelation: (IEmploymentRelation & MongooseDocument) | null =
    await EmploymentRelationModel.findById(
      user.activeEmploymentRelations[0].employmentRelation,
    );
  if (!employmentRelation)
    throw new CustomError("employmentRelation not found", 404);

  if (!company.celcoinAccountId) company = await createAccountPJ({ companyId });

  await user.populate("address");
  const account = await AccountModel.findById(user.accounts[0]);
  if (!account) throw new CustomError("Account not found", 404);
  await employmentRelation.populate("currentRole");
  await employmentRelation.populate("activeAccount");

  const authToken = await getCelcoinOriginatorAccessToken();

  console.log({
    phone: {
      country_code: user.phone.slice(1, 3),
      area_code: user.phone.slice(3, 5),
      number: user.phone.slice(5),
    },
    id_document: {
      type: "RG",
      number: user?.rg?.rgNumber ? user?.rg?.rgNumber : "162594318",
      issuer: user?.rg?.rgIssuer ? user?.rg?.rgIssuer : "detran",
      issue_date: user?.rg?.rgIssueDate ? user?.rg?.rgIssueDate : "2020-01-01",
    },
    address: {
      street_name: user.address.street,
      street_number: user.address.number,
      district: user.address.neighborhood,
      postal_code: user.address.postalCode,
      city: user.address.city,
      state_code: user.address.state,
      country_code: "bra",
    },
    pix: {
      key_type: account.pixType,
      key: account.pixKey,
    },
    external_bank_account: {
      bank_account: employmentRelation.activeAccount.accountNumber.slice(
        0,
        employmentRelation.activeAccount.accountNumber.length - 1,
      ),
      bank_account_digit:
        employmentRelation.activeAccount.accountNumber[
          employmentRelation.activeAccount.accountNumber.length - 1
        ],
      bank_branch: employmentRelation.activeAccount.agencyNumber,
      bank_account_type: "CACC",
      bank_code: employmentRelation.activeAccount.bank,
      ispb_code: ISPB_CODES[employmentRelation.activeAccount.bank],
    },
    qualification_request: {
      product: {
        id: env.PRODUCT_ID,
      },
      funding: {
        id: env.FUNDING_ID,
      },
      condition: {
        line_of_credit: {
          credit_limit: 100000,
          max_payment_amount: 200,
        },
        rating: {
          identifier: "test",
        },
      },
    },
    employer: {
      id: company.celcoinAccountId,
    },
    taxpayer_id: user.cpf,
    full_name: user.firstName + " " + user.lastName,
    nationality: user.nacionality,
    occupation: employmentRelation.currentRole.title,
  });

  const responseData = await fetch(
    `${env.CEL_CREDIT_PLATAFORM_URL}/banking/originator/persons`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        phone: {
          country_code: user.phone.slice(1, 3),
          area_code: user.phone.slice(3, 5),
          number: user.phone.slice(5),
        },
        id_document: {
          type: "RG",
          number: user?.rg?.rgNumber ? user?.rg?.rgNumber : "162594318",
          issuer: user?.rg?.rgIssuer ? user?.rg?.rgIssuer : "detran",
          issue_date: user?.rg?.rgIssueDate
            ? user?.rg?.rgIssueDate
            : "2020-01-01",
        },
        address: {
          street_name: user.address.street,
          street_number: user.address.number,
          district: user.address.neighborhood,
          postal_code: user.address.postalCode,
          city: user.address.city,
          state_code: user.address.state,
          country_code: "bra",
        },
        pix: {
          key_type: account.pixType.toUpperCase(),
          key: account.pixKey,
        },
        external_bank_account: {
          bank_account: employmentRelation.activeAccount.accountNumber.slice(
            0,
            employmentRelation.activeAccount.accountNumber.length - 1,
          ),
          bank_account_digit:
            employmentRelation.activeAccount.accountNumber[
              employmentRelation.activeAccount.accountNumber.length - 1
            ],
          bank_branch: employmentRelation.activeAccount.agencyNumber,
          bank_account_type: "CACC",
          bank_code: employmentRelation.activeAccount.bank,
          ispb_code: ISPB_CODES[employmentRelation.activeAccount.bank],
        },
        qualification_request: {
          product: {
            id: env.PRODUCT_ID,
          },
          funding: {
            id: env.FUNDING_ID,
          },
          condition: {
            line_of_credit: {
              credit_limit: 100000,
              max_payment_amount: 200,
            },
            rating: {
              identifier: "test",
            },
          },
        },
        employer: {
          id: company.celcoinAccountId,
        },
        taxpayer_id: user.cpf,
        full_name: user.firstName + " " + user.lastName,
        nationality: user.nacionality,
        occupation: employmentRelation.currentRole.title,
      }),
    },
  );

  const parsedResponseData = (await responseData.json()) as {
    id: string;
  };

  console.log({ responseData });

  console.log({ parsedResponseData4: parsedResponseData });

  user.celcoinAccountId = parsedResponseData.id;
  await user.save();

  const createEmploymentRelationResponseData = await fetch(
    `${env.CEL_CREDIT_PLATAFORM_URL}/banking/originator/business`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        type: "EMPLOYEE",
        person: {
          id: parsedResponseData.id,
        },
      }),
    },
  );

  const parsedCreateEmploymentRelationResponseData =
    (await createEmploymentRelationResponseData.json()) as { id: string };

  console.log({
    parsedResponseData5: parsedCreateEmploymentRelationResponseData,
  });

  employmentRelation.celcoinEmploymentRelationId =
    parsedCreateEmploymentRelationResponseData.id;

  return Promise.all([user.save(), employmentRelation.save()]);
};

export const createCelcoinEmploymentRelation = async ({
  userId,
  companyId,
}: {
  userId: string;
  companyId: string;
}) => {
  const user: (IPopulatedAddressUser & MongooseDocument) | null =
    await UserModel.findById(userId);
  const company: (IPopulatedAddressCompany & MongooseDocument) | null =
    await CompanyModel.findById(companyId);
  if (!company) throw new CustomError("Company not found", 404);
  if (!user) throw new CustomError("User not found", 404);
  if (!user.activeEmploymentRelations[0])
    throw new CustomError("No active employment relation", 409);
  const employmentRelation: (IEmploymentRelation & MongooseDocument) | null =
    await EmploymentRelationModel.findById(
      user.activeEmploymentRelations[0].employmentRelation,
    );
  if (!employmentRelation)
    throw new CustomError("employmentRelation not found", 404);

  if (!company.celcoinAccountId)
    throw new CustomError("celcoin company not found", 404);
  if (!user.celcoinAccountId)
    throw new CustomError("celcoin user not found", 404);

  await user.populate("address");
  await user.populate("account");
  await employmentRelation.populate("currentRole");
  await employmentRelation.populate("activeAccount");

  const authToken = await getCelcoinOriginatorAccessToken();

  const createEmploymentRelationResponseData = await fetch(
    `${env.CEL_CREDIT_PLATAFORM_URL}/banking/originator/business/${company.celcoinAccountId}/relations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        type: "EMPLOYEE",
        person: {
          id: user.celcoinAccountId,
        },
      }),
    },
  );

  const parsedCreateEmploymentRelationResponseData =
    (await createEmploymentRelationResponseData.json()) as { id: string };
  console.log({
    parsedResponseData6: parsedCreateEmploymentRelationResponseData,
  });
  // 7 dias para assinar
  employmentRelation.celcoinEmploymentRelationId =
    parsedCreateEmploymentRelationResponseData.id;

  return Promise.all([user.save(), employmentRelation.save()]);
};

export const getPeople = async () => {
  // "/banking/originator/persons"
  const authToken = await getCelcoinOriginatorAccessToken();
  const responseData = await fetch(
    `${env.CEL_CREDIT_PLATAFORM_URL}/banking/originator/persons`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    },
  );
  const parsedResponseData = (await responseData.json()) as {
    content: object[];
  };
  return parsedResponseData;
};

export const clearPeople = async () => {
  // "/banking/originator/persons"
};

export const getCompanies = async () => {
  // "/banking/originator/business"
  const authToken = await getCelcoinOriginatorAccessToken();
  const responseData = await fetch(
    `${env.CEL_CREDIT_PLATAFORM_URL}/banking/originator/business`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    },
  );
  const parsedResponseData = (await responseData.json()) as {
    content: object[];
  };
  return parsedResponseData;
};

export const clearCompanies = async () => {
  // "/banking/originator/persons"
};

export const getSimulations = async ({
  // userId,
  // companyId,
  requestedAmount,
  installments,
  interestRate,
}: {
  // userId: string;
  // companyId: string;
  requestedAmount: number;
  installments: number;
  interestRate: number;
}) => {
  // let user: (IPopulatedAddressUser & MongooseDocument) | null =
  //   await UserModel.findById(userId);
  // let company: (IPopulatedAddressCompany & MongooseDocument) | null =
  //   await CompanyModel.findById(companyId);
  // if (!company) throw new CustomError("Company not found", 404);
  // if (!user) throw new CustomError("User not found", 404);
  // if (!user.activeEmploymentRelations[0])
  //   throw new CustomError("No active employment relation", 409);
  // let employmentRelation: (IEmploymentRelation & MongooseDocument) | null =
  //   await EmploymentRelationModel.findById(user.activeEmploymentRelations[0]);
  // if (!employmentRelation)
  //   throw new CustomError("employmentRelation not found", 404);

  // if (!user.celcoinAccountId)
  //   [user, employmentRelation] = await createAccountPF({
  //     userId,
  //     companyId,
  //   });

  let firstOption: number, secondOption: number;

  if (installments > 12) {
    firstOption = 12;
    if (installments < 18 || installments > 18) {
      secondOption = 18;
    } else {
      secondOption = 24;
    }
  } else if (installments > 6) {
    firstOption = 6;
    if (installments < 12) {
      secondOption = 12;
    } else {
      secondOption = 18;
    }
  } else {
    firstOption = 12;
    secondOption = 18;
  }

  const option1 = await getSimulation({
    requestedAmount,
    installments: firstOption,
    interestRate,
  });

  console.log({ option1 });
  const option2 = await getSimulation({
    requestedAmount,
    installments,
    interestRate,
  });

  console.log({
    option2,
  });
  const option3 = await getSimulation({
    requestedAmount,
    installments: secondOption,
    interestRate,
  });

  console.log({
    option3,
  });

  return {
    simulations: [
      {
        totalValue: option1.requested_amount,
        installmentValue: option1.payment_amount,
        installments: option1.num_periods,
      },
      {
        totalValue: option2.requested_amount,
        installmentValue: option2.payment_amount,
        installments: option2.num_periods,
        requested: true,
      },
      {
        totalValue: option3.requested_amount,
        installmentValue: option3.payment_amount,
        installments: option3.num_periods,
      },
    ],
  };
};

export const getSimulation = async ({
  requestedAmount,
  installments,
  interestRate,
}: {
  requestedAmount: number;
  installments: number;
  interestRate: number;
}): Promise<{
  requested_amount: number;
  total_processing_cost: number;
  payment_amount: number;
  num_periods: number;
  interest_rate: number;
  tac_amount: number;
  finance_fee: number;
  num_payments: number;
  first_payment_date: string;
  disbursement_date: string;
  schedule: {
    payment: number;
    iof: number;
    balance: number;
    interest: number;
    principal: number;
    period: number;
    running_day: number;
    payment_date: string;
  }[];
}> => {
  const disbursementDate = new Date();
  disbursementDate.setMinutes(disbursementDate.getMinutes() - 180);
  const hourNowArray = disbursementDate.toISOString().split("T")[1].split(":");
  if (parseInt(hourNowArray[0]) >= 20)
    disbursementDate.setDate(disbursementDate.getDate() + 1);
  const disbursementDateArray = disbursementDate
    .toISOString()
    .split("T")[0]
    .split("-");
  const firstPaymentDate = new Date(
    `${disbursementDateArray[0]}-${(
      (parseInt(disbursementDateArray[1]) + 1) %
      12
    )
      .toString()
      .padStart(2, "0")}-05`,
  );

  const tacAmount = Math.floor(requestedAmount * 3) / 100;

  const { installmentValue: initialInstallmentValue } =
    newCalculateIntallmentAndTotalValues({
      loan: requestedAmount + tacAmount,
      interestRate,
      firstPaymentDate,
      disbursementDate: new Date(
        disbursementDate.toISOString().split("T")[0] + "T00:00:00.000Z",
      ),
      installments,
      installmentValue: (requestedAmount + tacAmount) / installments,
    });

  const iofTotal = newCaclIOF({
    loan: requestedAmount + tacAmount,
    interestRate,
    firstPaymentDate,
    disbursementDate: new Date(
      disbursementDate.toISOString().split("T")[0] + "T00:00:00.000Z",
    ),
    installments: installments,
    installmentValue: initialInstallmentValue,
  });

  let newTacAmount = Math.floor((requestedAmount + iofTotal) * 3) / 100;
  let financedAmount =
    Math.floor((newTacAmount + requestedAmount + iofTotal) * 100) / 100;

  let count = 0;
  while (newTacAmount !== Math.floor(financedAmount * 3) / 100 && count < 10) {
    count++;
    newTacAmount = Math.floor(financedAmount * 3) / 100;
    financedAmount =
      Math.floor((newTacAmount + requestedAmount + iofTotal) * 100) / 100;
  }

  return getCelcoinSimulation({
    originalRequestedAmount: requestedAmount,
    financedAmount:
      Math.floor((newTacAmount + requestedAmount + iofTotal) * 100) / 100,
    installments,
    interestRate,
    tacAmount:
      Math.floor((newTacAmount + requestedAmount + iofTotal) * 3) / 100,
    firstPaymentDate: firstPaymentDate.toISOString().split("T")[0],
    disbursementDate: disbursementDate.toISOString().split("T")[0],
  });
};

export const getCelcoinSimulation = async ({
  originalRequestedAmount,
  financedAmount,
  installments,
  interestRate,
  tacAmount,
  firstPaymentDate,
  disbursementDate,
  count = 0,
}: {
  originalRequestedAmount: number;
  financedAmount: number;
  installments: number;
  interestRate: number;
  tacAmount: number;
  firstPaymentDate: string;
  disbursementDate: string;
  count?: number;
}): Promise<{
  requested_amount: number;
  total_processing_cost: number;
  payment_amount: number;
  num_periods: number;
  interest_rate: number;
  tac_amount: number;
  finance_fee: number;
  num_payments: number;
  first_payment_date: string;
  disbursement_date: string;
  schedule: {
    payment: number;
    iof: number;
    balance: number;
    interest: number;
    principal: number;
    period: number;
    running_day: number;
    payment_date: string;
  }[];
}> => {
  const authToken = await getCelcoinOriginatorAccessToken();

  console.log({
    originalRequestedAmount,
    financedAmount,
    installments,
    interestRate,
    tacAmount,
    firstPaymentDate,
    disbursementDate,
    count,
  });

  const responseData = await fetch(
    `${env.CEL_CREDIT_PLATAFORM_URL}/banking/originator/applications/preview-financed-amount`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        schedule_type: "MONTHLY",
        iof_type: "PERSON",
        interest_rate: 0.045,
        tac_amount: tacAmount,
        finance_fee: 0,
        num_payments: installments,
        first_payment_date: firstPaymentDate,
        disbursement_date: disbursementDate,
        financed_amount: financedAmount,
      }),
    },
  );
  const parsedResponseData = (await responseData.json()) as {
    requested_amount: number;
    total_processing_cost: number;
    payment_amount: number;
    num_periods: number;
    interest_rate: number;
    tac_amount: number;
    finance_fee: number;
    num_payments: number;
    first_payment_date: string;
    disbursement_date: string;
    schedule: {
      payment: number;
      iof: number;
      balance: number;
      interest: number;
      principal: number;
      period: number;
      running_day: number;
      payment_date: string;
    }[];
  };
  console.log({ parsedResponseData8: parsedResponseData });

  if (originalRequestedAmount !== parsedResponseData.requested_amount) {
    if (
      parsedResponseData.requested_amount ===
      originalRequestedAmount + 0.01
    ) {
      return getCelcoinSimulation({
        originalRequestedAmount,
        financedAmount,
        installments,
        interestRate,
        tacAmount: tacAmount + 0.01,
        firstPaymentDate,
        disbursementDate,
        count: count + 1,
      });
    }

    const newFinancedAmount =
      originalRequestedAmount + parsedResponseData.total_processing_cost;

    return getCelcoinSimulation({
      originalRequestedAmount,
      financedAmount:
        newFinancedAmount + (newFinancedAmount === financedAmount ? 0.01 : 0),
      installments,
      interestRate,
      tacAmount:
        Math.floor(
          (newFinancedAmount +
            (newFinancedAmount === financedAmount ? 0.01 : 0)) *
            3,
        ) / 100,
      firstPaymentDate,
      disbursementDate,
      count: count + 1,
    });
  } else {
    return parsedResponseData;
  }
};

export const createCompanyCreditLine = async ({
  companyId,
}: {
  companyId: string;
}) => {
  const company: (IPopulatedAddressCompany & MongooseDocument) | null =
    await CompanyModel.findById(companyId);
  if (!company) throw new CustomError("Company not found", 404);
  if (!company.celcoinAccountId)
    throw new CustomError("celcoin company not found", 404);

  const authToken = await getCelcoinOriginatorAccessToken();
  const responseData = await fetch(
    `${env.CEL_CREDIT_PLATAFORM_URL}/banking/originator/products/${env.PRODUCT_ID}/qualification-requests`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        funding: {
          id: env.FUNDING_ID,
        },
        role: "EMPLOYER",
        employer: {
          id: company.celcoinAccountId,
        },
      }),
    },
  );
  const parsedResponseData = (await responseData.json()) as {
    id?: string;
    message?: string;
  };
  console.log({ parsedResponseData9: parsedResponseData });
  console.log({
    aux: `${env.CEL_CREDIT_PLATAFORM_URL}/banking/originator/products/${env.PRODUCT_ID}/qualification-requests?employer_id=${company.celcoinAccountId}`,
  });
  if (
    parsedResponseData.message ===
    "This employer has already been requested for qualification for this product and funding"
  ) {
    const creditLineResponseData = await fetch(
      `${env.CEL_CREDIT_PLATAFORM_URL}/banking/originator/products/${env.PRODUCT_ID}/qualification-requests?employer_id=${company.celcoinAccountId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
    console.log({ creditLineResponseData });
    const creditLineResponseDataParsed =
      (await creditLineResponseData.json()) as { id: string };
    console.log({ creditLineResponseDataParsed });
    company.celcoinCreditLineId = creditLineResponseDataParsed.id;
    return company.save();
  } else if (parsedResponseData.id) {
    company.celcoinCreditLineId = parsedResponseData.id;
    return company.save();
  }
};

export const createUserCreditLine = async ({
  companyId,
  userId,
}: {
  companyId: string;
  userId: string;
}) => {
  const user: (IPopulatedAddressUser & MongooseDocument) | null =
    await UserModel.findById(userId);
  const company: (IPopulatedAddressCompany & MongooseDocument) | null =
    await CompanyModel.findById(companyId);
  if (!company) throw new CustomError("Company not found", 404);
  if (!user) throw new CustomError("User not found", 404);
  if (!user.activeEmploymentRelations[0])
    throw new CustomError("No active employment relation", 409);
  const employmentRelation: (IEmploymentRelation & MongooseDocument) | null =
    await EmploymentRelationModel.findById(
      user.activeEmploymentRelations[0].employmentRelation,
    );
  if (!employmentRelation)
    throw new CustomError("employmentRelation not found", 404);

  if (!company.celcoinAccountId)
    throw new CustomError("celcoin company not found", 404);
  if (!user.celcoinAccountId)
    throw new CustomError("celcoin user not found", 404);

  const authToken = await getCelcoinOriginatorAccessToken();
  const responseData = await fetch(
    `${env.CEL_CREDIT_PLATAFORM_URL}/banking/originator/products/${env.PRODUCT_ID}/qualification-requests`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        funding: {
          id: env.FUNDING_ID,
        },
        role: "BORROWER",
        employer: {
          id: company.celcoinAccountId,
        },
        borrower: {
          id: user.celcoinAccountId,
        },
      }),
    },
  );
  const parsedResponseData = (await responseData.json()) as {
    id: string;
  };
  console.log({ parsedResponseData10: parsedResponseData });
  user.celcoinCreditLineId = parsedResponseData.id;
  return user.save();
};

export const approveUserCreditLine = async ({ userId }: { userId: string }) => {
  const user: (IPopulatedAddressUser & MongooseDocument) | null =
    await UserModel.findById(userId);
  if (!user) throw new CustomError("User not found", 404);
  if (!user.celcoinAccountId)
    throw new CustomError("celcoin user not found", 404);
  if (!user.celcoinCreditLineId)
    throw new CustomError("celcoin user not found", 404);

  return approveCreditLine({
    creditLineId: user.celcoinCreditLineId,
  });
};

export const approveCompanyCreditLine = async ({
  companyId,
}: {
  companyId: string;
}) => {
  const company: (IPopulatedAddressCompany & MongooseDocument) | null =
    await CompanyModel.findById(companyId);
  if (!company) throw new CustomError("Company not found", 404);
  if (!company.celcoinAccountId)
    throw new CustomError("celcoin company not found", 404);
  if (!company.celcoinCreditLineId)
    throw new CustomError("celcoin user not found", 404);

  return approveCreditLine({
    creditLineId: company.celcoinCreditLineId,
  });
};

export const configureCreditLine = async ({
  creditLineId,
}: {
  creditLineId: string;
}) => {
  const authToken = await getCelcoinOriginatorAccessToken();
  const responseData = await fetch(
    `${env.CEL_CREDIT_PLATAFORM_URL}/banking/originator/products/${env.PRODUCT_ID}/qualification-requests/${creditLineId}/qualify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        status: "QUALIFIED",
      }),
    },
  );

  const parsedResponseData = await responseData.json();
  console.log({ parsedResponseData11: parsedResponseData });
  return parsedResponseData;
};

export const approveCreditLine = async ({
  creditLineId,
}: {
  creditLineId: string;
}) => {
  const authToken = await getCelcoinOriginatorAccessToken();
  const responseData = await fetch(
    `${env.CEL_CREDIT_PLATAFORM_URL}/banking/originator/products/${env.PRODUCT_ID}/qualification-requests/${creditLineId}/qualify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        status: "QUALIFIED",
      }),
    },
  );

  const parsedResponseData = await responseData.json();
  console.log({ parsedResponseData12: parsedResponseData });
  return parsedResponseData;
};

export const createContract = async ({
  userId,
  companyId,
  requestedAmount,
  installments,
  interestRate,
}: {
  userId: string;
  companyId: string;
  requestedAmount: number;
  installments: number;
  interestRate: number;
}): Promise<{
  createdLoanAgreement;
  createdInstallments;
}> => {
  let user: (IPopulatedAddressUser & MongooseDocument) | null =
    await UserModel.findById(userId);
  let company: (IPopulatedAddressCompany & MongooseDocument) | null =
    await CompanyModel.findById(companyId);
  if (!company) throw new CustomError("Company not found", 404);
  if (!user) throw new CustomError("User not found", 404);
  if (!user.activeEmploymentRelations[0])
    throw new CustomError("No active employment relation", 409);
  console.log({ aux: user.activeEmploymentRelations[0] });
  const employmentRelation: (IEmploymentRelation & MongooseDocument) | null =
    await EmploymentRelationModel.findById(
      user.activeEmploymentRelations[0].employmentRelation,
    );
  console.log("111");
  if (!employmentRelation)
    throw new CustomError("employmentRelation not found", 404);
  console.log("222");
  const account = await AccountModel.findById(user.accounts[0]);
  if (!account) throw new CustomError("Account not found", 404);

  console.log({ company, user, employmentRelation });

  if (!company.celcoinAccountId) {
    company = await createAccountPJ({
      companyId,
    });
  }
  if (!user.celcoinAccountId) {
    [user] = await createAccountPF({
      userId,
      companyId,
    });
  }
  if (!company.celcoinCreditLineId) {
    const auxCOmpany = await createCompanyCreditLine({
      companyId,
    });
    if (auxCOmpany) company = auxCOmpany;
  }
  if (!user.celcoinCreditLineId) {
    user = await createUserCreditLine({
      companyId,
      userId,
    });
  }
  if (!company.celcashAccountId) {
    company = await createCelcashAccountPJ({
      companyId,
    });
  }
  if (!user.celcashAccountId) {
    user = await createCelcashAccountPF({
      userId,
    });
  }
  createCelcashAccountPJ;
  await company.populate("address");

  const simulation = await getSimulation({
    requestedAmount,
    installments,
    interestRate,
  });

  console.log({ simulation });

  const authToken = await getCelcoinOriginatorAccessToken();
  const responseData = await fetch(
    `${env.CEL_CREDIT_PLATAFORM_URL}/banking/originator/applications`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        product: {
          id: env.PRODUCT_ID,
        },
        borrower: {
          id: user.celcoinAccountId,
        },
        custom_variables: {
          values: {
            employer_address: company.address.street,
            employer_legal_name: company.name,
            employer_taxpayer_id: company.cnpj,
          },
        },
        funding: {
          id: env.FUNDING_ID,
        },
        beneficiary_account: {
          pix: {
            key_type: account.pixType.toUpperCase(),
            key: account.pixKey,
          },
        },
        requested_amount: simulation.requested_amount,
        interest_rate: simulation.interest_rate,
        tac_amount: simulation.tac_amount,
        finance_fee: simulation.finance_fee,
        num_payments: simulation.num_payments,
        first_payment_date: simulation.first_payment_date,
        disbursement_date: simulation.disbursement_date,
        signature_collect_method: "LINK",
        payment_method: "PIX",
        funding_signature_required: true,
        originator_signature_required: true,
      }),
    },
  );

  const parsedResponseData = (await responseData.json()) as {
    id: string;
  };
  console.log({ parsedResponseData13: parsedResponseData });

  const celcashAccessToken = await getCelcashAccessToken();
  const schedule = await Promise.all(
    simulation.schedule.map(async (installment) => {
      const newInstallment = new InstallmentModel({
        amount: installment.payment,
        dueDate: installment.payment_date,
        status: InstallmentStatus.PENDING,
      });

      // 541ffc01a5e584895c1d86b3dbae98290f1ddfd6
      const chargeData = await createCelcashInstallment({
        celcashAccountId: user?.celcashAccountId,
        installment: newInstallment,
        celcashAccessToken,
        user,
      });
      newInstallment.chargeCelcashId = chargeData.Charge.galaxPayId;
      newInstallment.paymentLink = chargeData.Charge.paymentLink;
      return newInstallment;
    }),
  );
  // schedule
  const loanAgreement: LoanAgreement & MongooseDocument =
    new LoanAgreementModel({
      amount: simulation.requested_amount,
      numberOfInstallments: simulation.num_payments,
      interestRate: simulation.interest_rate,
      installments: schedule,
      cellcoinId: parsedResponseData.id,
      employmentRelation: employmentRelation._id,
    });

  const [createdLoanAgreement, createdInstallments] = await Promise.all([
    loanAgreement.save(),
    Promise.all(
      schedule.map((installment) => {
        installment.loanAgreement = loanAgreement._id;
        installment.save();
      }),
    ),
  ]);
  return {
    createdLoanAgreement,
    createdInstallments,
  };
};

// {
//   "event": "transaction.updateStatus",
//   "webhookId": 864751379,
//   "confirmHash": "f208a4032b32b9251a738a61ad05a0ad",
//   "Transaction": {
//       "myId": "pay-665db95e9f35b9.81175523",
//       "galaxPayId": 1,
//       "chargeMyId": "12ASD",
//       "chargeGalaxPayId": 2,
//       "subscriptionMyId": "2A",
//       "subscriptionGalaxPayId": 1,
//       "value": 12999,
//       "payday": "2024-06-03",
//       "fee": 300,
//       "payedOutsideGalaxPay": false,
//       "additionalInfo": "Lorem ipsum dolor sit amet.",
//       "installment": 3,
//       "paydayDate": "2024-06-03",
//       "AbecsReasonDenied": {
//           "code": "51",
//           "message": "Saldo\/limite insuficiente"
//       },
//       "datetimeLastSentToOperator": "2024-06-03 09:38:55",
//       "status": "captured",
//       "tid": "pay-665db95fb3dd16.49070923",
//       "authorizationCode": "pay-665db95fc2d774.89764133",
//       "reasonDenied": "Limite do cartão insuficiente.",
//       "createdAt": "2020-06-02 10:10:00",
//       "Boleto": {
//           "pdf": "https:\/\/app.celcoin.com.br\/link-pdf",
//           "bankLine": "23312323232323232323232323232"
//       },
//       "Pix": {
//           "qrCode": "ABC123ABC123ABC123ABC123ABC123ABC123ABC123ABC123ABC123ABC123ABC123",
//           "reference": "E202406030938565449F04E8BAD4C04D6037E8B9AD1C6EE",
//           "image": "https:\/\/app.celcoin.com.br\/link-image-qrcode",
//           "page": "https:\/\/app.celcoin.com.br\/link-page-qrcode",
//           "endToEnd": "E202406030938565449F04E8BAD4C04D6037E8B9AD1C6EE"
//       }
//   },
//   "Charge": {
//       "galaxPayId": 11,
//       "myId": "pay-665db960722254.45984186",
//       "mainPaymentMethodId": "creditcard",
//       "value": 12999,
//       "additionalInfo": "Lorem ipsum dolor sit amet.",
//       "status": "active",
//       "Customer": {
//           "galaxPayId": 1,
//           "myId": "pay-665db960cf9e43.65060671",
//           "phones": [
//               3140201512,
//               31983890110
//           ],
//           "name": "Lorem ipsum dolor sit amet.",
//           "document": "65167684200",
//           "createdAt": "2020-06-02 10:10:00",
//           "updatedAt": "2020-06-02 10:10:00",
//           "Address": "-"
//       },
//       "PaymentMethodCreditCard": {
//           "Card": {
//               "galaxPayId": 1,
//               "myId": "pay-665db9615b6a40.88056944",
//               "number": "5451*********1515",
//               "createdAt": "2020-06-02 10:10:00",
//               "updatedAt": "2020-06-02 10:10:00",
//               "expiresAt": "2024-06"
//           }
//       },
//       "PaymentMethodBoleto": {
//           "fine": 100,
//           "interest": 200,
//           "instructions": "Lorem ipsum dolor sit amet."
//       },
//       "PaymentMethodPix": {
//           "fine": 100,
//           "interest": 200,
//           "instructions": "Lorem ipsum dolor sit amet.",
//           "Deadline": {
//               "type": "days",
//               "value": 60
//           }
//       }
//   }
// }

export const getCelcashAccessToken = async () => {
  const authString = Buffer.from(`${env.GALAX_ID}:${env.GALAX_HASH}`).toString(
    "base64",
  );

  console.log(`${env.CELCASH_URL}/token`);

  const responseData = await fetch(`${env.CELCASH_URL}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Authorization: `Basic ${authString}`,
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      scope:
        "customers.read customers.write plans.read plans.write transactions.read transactions.write webhooks.write balance.read balance.write cards.read cards.write card-brands.read subscriptions.read subscriptions.write charges.read charges.write boletos.read",
    }),
  });
  const parsedResponseData = (await responseData.json()) as {
    access_token: string;
    expires_in: number;
    token_type: string;
    error: {
      details: object;
    };
  };
  console.log({
    parsedResponseData2: parsedResponseData,
  });

  return parsedResponseData.access_token;
};

export const createCelcashAccountPJ = async ({
  companyId,
}: {
  companyId: string;
}) => {
  const company: (IPopulatedAddressCompany & MongooseDocument) | null =
    await CompanyModel.findById(companyId);
  if (!company) throw new CustomError("Company not found", 404);
  await company.populate("managerPartner");
  console.log({ company });

  await company.populate("address");

  const authToken = await getCelcashAccessToken();

  console.log({
    authToken,
    aux: {
      myId: company._id.toString(),
      name: company.name,
      document: company.cnpj,
      emails: [company.managerPartner.personalEmail],
      phones: [company.phone],
      Address: {
        zipCode: company.address.postalCode,
        street: company.address.street,
        number: company.address.number,
        complement: company.address.addressLine2,
        neighborhood: company.address.neighborhood,
        city: company.address.city,
        state: company.address.state,
      },
    },
  });
  const responseData = await fetch(`${env.CELCASH_URL}/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      myId: company._id.toString(),
      name: company.name,
      document: company.cnpj,
      emails: [company.managerPartner.personalEmail],
      phones: [company.phone.slice(3)],
      Address: {
        zipCode: company.address.postalCode,
        street: company.address.street,
        number: company.address.number,
        complement: company.address.addressLine2,
        neighborhood: company.address.neighborhood,
        city: company.address.city,
        state: company.address.state,
      },
    }),
  });
  console.log({ responseData });
  const parsedResponseData = (await responseData.json()) as {
    Customer: {
      galaxPayId: string;
    };
    error: {
      details: object;
    };
  };
  console.log({
    parsedResponseData30: parsedResponseData,
    details: parsedResponseData?.error?.details,
  });

  company.celcashAccountId = parsedResponseData.Customer.galaxPayId;
  return company.save();
};

export const createCelcashAccountPF = async ({ userId }) => {
  const user: (IPopulatedAddressUser & MongooseDocument) | null =
    await UserModel.findById(userId);
  if (!user) throw new CustomError("User not found", 404);
  console.log({ user });

  await user.populate("address");

  const authToken = await getCelcashAccessToken();

  const responseData = await fetch(`${env.CELCASH_URL}/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      myId: user._id.toString(),
      name: user.firstName + " " + user.lastName,
      document: user.cpf,
      emails: [user.personalEmail],
      phones: [user.phone.slice(3)],
      Address: {
        zipCode: user.address.postalCode,
        street: user.address.street,
        number: user.address.number,
        complement: user.address.addressLine2,
        neighborhood: user.address.neighborhood,
        city: user.address.city,
        state: user.address.state,
      },
    }),
  });
  console.log({ responseData });
  const parsedResponseData = (await responseData.json()) as {
    Customer: {
      galaxPayId: string;
    };
  };
  console.log({ parsedResponseData31: parsedResponseData });

  user.celcashAccountId = parsedResponseData.Customer.galaxPayId;
  return user.save();
};

export const createCelcashInstallment = async ({
  installment,
  celcashAccountId,
  celcashAccessToken,
  user,
}) => {
  console.log({ celcashAccountId, installment });
  const responseData = await fetch(`${env.CELCASH_URL}/charges`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${celcashAccessToken}`,
    },
    body: JSON.stringify({
      myId: installment._id,
      value: installment.amount * 100,
      payday: installment.dueDate.toISOString().split("T")[0],
      mainPaymentMethodId: "pix",
      Customer: {
        galaxPayId: celcashAccountId,
        name: user.firstName + " " + user.lastName,
        emails: [user.personalEmail],
        document: user.cpf,
      },
      PaymentMethodPix: {
        fine: 100,
        interest: 200,
      },
    }),
  });
  console.log({ responseData });
  const parsedResponseData = (await responseData.json()) as {
    Charge: {
      galaxPayId: string;
      paymentLink: string;
    };
    error?: {
      details?: object;
    };
  };
  console.log({
    parsedResponseData32: parsedResponseData,
    details: parsedResponseData?.error?.details,
  });

  return parsedResponseData;
};

export const getOpenInstallments = async ({
  companyId,
  year,
  month,
}: {
  companyId: string;
  year?: string;
  month?: string;
}) => {
  const employmentRelations = await EmploymentRelationModel.find({
    company: companyId,
  });
  console.log({ companyId, year, month });
  const employmentRelationsIds = employmentRelations.map((employmentRelation) =>
    employmentRelation._id.toString(),
  );
  const loanAgreements = await LoanAgreementModel.find({
    employmentRelation: { $in: employmentRelationsIds },
  }).populate("installments");
  // await loanAgreements.populate("installments")
  // const employmentRelationsIds = employmentRelations.map((employmentRelation) =>
  //   employmentRelation._id.toString(),
  // );
  const loanAgreementsIds = loanAgreements.map((loanAgreement) =>
    loanAgreement._id.toString(),
  );
  console.log({
    // loanAgreements,
    employmentRelationsIds,
    loanAgreementsIds,
    loanAgreement: { $in: loanAgreementsIds },
  });

  const query: {
    loanAgreement: {
      $in: string[];
    };
    dueDate?: {
      $gte: Date;
      $lte: Date;
    };
  } = {
    loanAgreement: { $in: loanAgreementsIds },
  };

  if (year && month && !isNaN(parseInt(year)) && !isNaN(parseInt(month))) {
    const limitStartDate = new Date(
      parseInt(year),
      parseInt(month),
      1,
      0,
      0,
      0,
    );
    const limitEndDate = new Date(
      parseInt(year),
      parseInt(month),
      30,
      23,
      59,
      59,
    );
    query.dueDate = {
      $gte: limitStartDate,
      $lte: limitEndDate,
    };
    console.log({
      dueDate: {
        $gte: limitStartDate,
        $lte: limitEndDate,
      },
    });
  }
  console.log({ query, array: query.loanAgreement.$in });
  const installments = await InstallmentModel.find(query);
  console.log({ installments });
  return installments;
};

export const createPaymentSlip = async ({
  companyId,
  installmentIds,
}: {
  companyId: string;
  installmentIds: string[];
}) => {
  const installments = (await InstallmentModel.find({
    _id: { $in: installmentIds },
  }).populate("loanAgreement")) as (IPopulatedInstallment & MongooseDocument)[];
  const existingPaymentSlips = {};
  installments.forEach((installment) => {
    if (installment.paymentSlip) {
      existingPaymentSlips[installment.paymentSlip.toString()] = true;
    }
  });
  if (Object.keys(existingPaymentSlips).length) {
    throw new CustomError(
      "Please cancel the current payment slips to proceed",
      409,
      { paymentSlips: Object.keys(existingPaymentSlips) },
    );
  }
  const company = await CompanyModel.findById(companyId);

  if (!company) throw new CustomError("Company not found", 404);

  let totalPayment = 0;
  installments.forEach((installment) => {
    totalPayment += installment.amount;
  });

  console.log({ installments2: installments });
  const newPaymentSlip: PaymentSlip & MongooseDocument = new PaymentSlipModel({
    value: totalPayment,
    dueDate: installments[0].dueDate,
    fine: 100,
    interest: 200,
    deadlineDays: 0,
    installments: installmentIds,
    status: PaymentSlipStatus.PENDING,
  });

  const celcashAccessToken = await getCelcashAccessToken();

  const responseData = await fetch(`${env.CELCASH_URL}/charges`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${celcashAccessToken}`,
    },
    body: JSON.stringify({
      myId: newPaymentSlip._id,
      value: totalPayment * 100,
      payday: installments[0].dueDate.toISOString().split("T")[0],
      mainPaymentMethodId: "boleto",
      Customer: {
        galaxPayId: company.celcashAccountId,
        name: company.name,
        // emails: [company.],
        document: company.cnpj,
      },
      PaymentMethodBoleto: {
        fine: 100,
        interest: 200,
        deadlineDays: 0,
      },
    }),
  });

  const parsedResponseData = (await responseData.json()) as {
    type: boolean;
    Charge: {
      galaxPayId: number;
      myId: string;
      paymentLink: string;
      value: number;
      status: string;
      PaymentMethodBoleto: {
        fine: number;
        interest: number;
        deadlineDays: number;
      };
    };
  };
  newPaymentSlip.celcashId = parsedResponseData.Charge.galaxPayId;
  newPaymentSlip.paymentLink = parsedResponseData.Charge.paymentLink;
  const [savedPaymentSlip, savedInstallments] = await Promise.all([
    newPaymentSlip.save(),
    Promise.all(
      installments.map((installment) => {
        installment.paymentSlip = newPaymentSlip._id;
        return installment.save();
      }),
    ),
  ]);
  console.log({ parsedResponseData, savedPaymentSlip, savedInstallments });
  return { result: parsedResponseData, savedPaymentSlip, savedInstallments };
};

export const cancelPaymentSlip = async ({ paymentSlipId }) => {
  const installments = (await InstallmentModel.find({
    paymentSlip: paymentSlipId,
  })) as (Installment & MongooseDocument)[];
  const paymentSlip = await PaymentSlipModel.findById(paymentSlipId);
  if (!paymentSlip) throw new CustomError("Payment Slip Not found", 404);
  if (
    paymentSlip.status === PaymentSlipStatus.PAID ||
    paymentSlip.status === PaymentSlipStatus.EXTERNAL_PAYMENT
  )
    throw new CustomError("Payment Slip already paid", 409);
  if (paymentSlip.status === PaymentSlipStatus.CANCELED)
    throw new CustomError("Payment Slip already canceled", 409);
  paymentSlip.status = PaymentSlipStatus.CANCELED;
  console.log({ installments, paymentSlip });
  if (!installments.length)
    throw new CustomError("No installments in the payment slip");

  const celcashAccessToken = await getCelcashAccessToken();
  const responseData = await fetch(
    `${env.CELCASH_URL}/charges/${paymentSlipId}/myId`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${celcashAccessToken}`,
      },
    },
  );
  const parsedResponseData = (await responseData.json()) as {
    type?: boolean;
    error?: {
      message: string;
    };
  };
  if (
    parsedResponseData.type ||
    parsedResponseData?.error?.message ===
      "Nenhuma cobrança avulsa encontrada para cancelar."
  ) {
    const [updatedPaymentSlip, updatedInstallments] = await Promise.all([
      paymentSlip.save(),
      Promise.all(
        installments.map((installment) => {
          if (!installment.paymentSlip) return;
          installment.paymentSlips.push(installment.paymentSlip);
          installment.paymentSlip = null;
          installment.paymentLink = "";
          return installment.save();
        }),
      ),
    ]);
    return {
      result: parsedResponseData,
      updatedPaymentSlip,
      updatedInstallments,
    };
  }
  return parsedResponseData;
};

export const setWebhooks = async () => {
  const celcashAccessToken = await getCelcashAccessToken();
  const responseData = await fetch(`${env.CELCASH_URL}/webhooks`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${celcashAccessToken}`,
    },
    body: JSON.stringify({
      url: "https://server.vexocred.com/webhook-galax-pay",
      events: [
        "transaction.updateStatus",
        "subscription.addTransaction",
        "company.cashOut",
        "chargeback.update",
      ],
    }),
  });
  console.log({ responseData });
  const parsedResponseData = await responseData.json();
  return parsedResponseData;
};

export const celcashWebhooks = async ({
  event,
  transactionData,
  charge,
}: {
  event: string;
  transactionData: {
    myId: string;
    galaxPayId: string;
    chargeMyId: string;
    chargeGalaxPayId: string;
    value: number;
    payday: Date;
    fee: number;
    payedOutsideGalaxPay: boolean;
    additionalInfo: string;
    installment: number;
    paydayDate: Date;
    AbecsReasonDenied: {
      code: string;
      message: string;
    };
    status: string;
    tid: string;
    authorizationCode: string;
    reasonDenied: string;
    Boleto: {
      pdf: string;
      bankLine: string;
    };
  };
  charge;
}) => {
  if (event === "transaction.updateStatus") {
    const paymentSlip = await PaymentSlipModel.findById(charge.myId);
    if (!paymentSlip) {
      throw new CustomError("Payment slip not found");
    }
    const storedTransaction = await TransactionModel.findById(
      transactionData.myId,
    );
    if (!storedTransaction) {
      const newTransaction = new TransactionModel({
        galaxPayId: transactionData.galaxPayId,
        chargeMyId: transactionData.chargeMyId,
        chargeGalaxPayId: transactionData.chargeGalaxPayId,
        value: transactionData.value,
        payday: transactionData.payday,
        fee: transactionData.fee,
        payedOutsideGalaxPay: transactionData.payedOutsideGalaxPay,
        additionalInfo: transactionData.additionalInfo,
        installment: transactionData.installment,
        paydayDate: transactionData.paydayDate,
        abecsReasonDenied: transactionData.AbecsReasonDenied,
        status: transactionData.status,
        tid: transactionData.tid,
        authorizationCode: transactionData.authorizationCode,
        reasonDenied: transactionData.reasonDenied,
        boleto: transactionData.Boleto,
      });
      paymentSlip.transactions.push(newTransaction);
      const [savedPaymentSlip, savedTransaction] = await Promise.all([
        paymentSlip.save(),
        newTransaction.save(),
      ]);
      console.log({ savedPaymentSlip, savedTransaction });
      return { savedPaymentSlip, savedTransaction };
    } else {
      console.log({ storedTransaction });
      storedTransaction.galaxPayId = transactionData.galaxPayId;
      storedTransaction.chargeMyId = transactionData.chargeMyId;
      storedTransaction.chargeGalaxPayId = transactionData.chargeGalaxPayId;
      storedTransaction.value = transactionData.value;
      storedTransaction.payday = transactionData.payday;
      storedTransaction.fee = transactionData.fee;
      storedTransaction.payedOutsideGalaxPay =
        transactionData.payedOutsideGalaxPay;
      storedTransaction.additionalInfo = transactionData.additionalInfo;
      storedTransaction.installment = transactionData.installment;
      storedTransaction.paydayDate = transactionData.paydayDate;
      storedTransaction.abecsReasonDenied = transactionData.AbecsReasonDenied;
      storedTransaction.status = transactionData.status;
      storedTransaction.tid = transactionData.tid;
      storedTransaction.authorizationCode = transactionData.authorizationCode;
      storedTransaction.reasonDenied = transactionData.reasonDenied;
      storedTransaction.boleto = transactionData.Boleto;
      if (
        !paymentSlip.transactions.find(
          (transaction) => transaction.toString() === transactionData.myId,
        )
      )
        paymentSlip.transactions.push(storedTransaction._id);
      const [savedPaymentSlip, savedTransaction] = await Promise.all([
        paymentSlip.save(),
        storedTransaction.save(),
      ]);
      return { savedPaymentSlip, savedTransaction };
    }

    //   {
    //     "event": "transaction.updateStatus",
    //     "webhookId": 450185575,
    //     "confirmHash": "68a31d7565f7d823cdd54ad7ff59e821",
    //     "Transaction": {
    //         "myId": "pay-665e5005d7c759.96811506",
    //         "galaxPayId": 1,
    //         "chargeMyId": "12ASD",
    //         "chargeGalaxPayId": 2,
    //         "subscriptionMyId": "2A",
    //         "subscriptionGalaxPayId": 1,
    //         "value": 12999,
    //         "payday": "2024-06-03",
    //         "fee": 300,
    //         "payedOutsideGalaxPay": false,
    //         "additionalInfo": "Lorem ipsum dolor sit amet.",
    //         "installment": 3,
    //         "paydayDate": "2024-06-03",
    //         "AbecsReasonDenied": {
    //             "code": "51",
    //             "message": "Saldo\/limite insuficiente"
    //         },
    //         "datetimeLastSentToOperator": "2024-06-03 20:21:42",
    //         "status": "captured",
    //         "tid": "pay-665e5006c71ed0.00953514",
    //         "authorizationCode": "pay-665e5006d47206.02852814",
    //         "reasonDenied": "Limite do cartão insuficiente.",
    //         "createdAt": "2020-06-02 10:10:00",
    //         "Boleto": {
    //             "pdf": "https:\/\/app.celcoin.com.br\/link-pdf",
    //             "bankLine": "23312323232323232323232323232"
    //         },
    //         "Pix": {
    //             "qrCode": "ABC123ABC123ABC123ABC123ABC123ABC123ABC123ABC123ABC123ABC123ABC123",
    //             "reference": "E2024060320214344A8DB75E068D70D0329EA5E0ED00413",
    //             "image": "https:\/\/app.celcoin.com.br\/link-image-qrcode",
    //             "page": "https:\/\/app.celcoin.com.br\/link-page-qrcode",
    //             "endToEnd": "E2024060320214344A8DB75E068D70D0329EA5E0ED00413"
    //         }
    //     },
    //     "Charge": {
    //         "galaxPayId": 11,
    //         "myId": "pay-665e500776b668.45110154",
    //         "mainPaymentMethodId": "creditcard",
    //         "value": 12999,
    //         "additionalInfo": "Lorem ipsum dolor sit amet.",
    //         "status": "active",
    //         "Customer": {
    //             "galaxPayId": 1,
    //             "myId": "pay-665e5007c8ae37.63948426",
    //             "phones": [
    //                 3140201512,
    //                 31983890110
    //             ],
    //             "name": "Lorem ipsum dolor sit amet.",
    //             "document": "47504058416",
    //             "createdAt": "2020-06-02 10:10:00",
    //             "updatedAt": "2020-06-02 10:10:00",
    //             "Address": "-"
    //         },
    //         "PaymentMethodCreditCard": {
    //             "Card": {
    //                 "galaxPayId": 1,
    //                 "myId": "pay-665e50085033d5.83973202",
    //                 "number": "5451*********1515",
    //                 "createdAt": "2020-06-02 10:10:00",
    //                 "updatedAt": "2020-06-02 10:10:00",
    //                 "expiresAt": "2024-06"
    //             }
    //         },
    //         "PaymentMethodBoleto": {
    //             "fine": 100,
    //             "interest": 200,
    //             "instructions": "Lorem ipsum dolor sit amet."
    //         },
    //         "PaymentMethodPix": {
    //             "fine": 100,
    //             "interest": 200,
    //             "instructions": "Lorem ipsum dolor sit amet.",
    //             "Deadline": {
    //                 "type": "days",
    //                 "value": 60
    //             }
    //         }
    //     }
    // }
  } else if (event === "subscription.addTransaction") {
    //   {
    //     "event": "subscription.addTransaction",
    //     "webhookId": 98724128,
    //     "confirmHash": "9f0fe5ecfa055d2182d683d4ad1a512b",
    //     "Transaction": {
    //         "myId": "pay-665e500ed5c379.60460860",
    //         "galaxPayId": 1,
    //         "chargeMyId": "12ASD",
    //         "chargeGalaxPayId": 2,
    //         "subscriptionMyId": "2A",
    //         "subscriptionGalaxPayId": 1,
    //         "value": 12999,
    //         "payday": "2024-06-03",
    //         "payedOutsideGalaxPay": false,
    //         "fee": 300,
    //         "additionalInfo": "Lorem ipsum dolor sit amet.",
    //         "installment": 3,
    //         "authorizationCode": "pay-665e500f8ef712.48902194",
    //         "paydayDate": "2024-06-03",
    //         "tid": "pay-665e500fab5335.40813739",
    //         "AbecsReasonDenied": {
    //             "code": "51",
    //             "message": "Saldo\/limite insuficiente"
    //         },
    //         "datetimeLastSentToOperator": "2024-06-03 20:21:51",
    //         "status": "captured",
    //         "reasonDenied": "Limite do cartão insuficiente.",
    //         "createdAt": "2020-06-02 10:10:00",
    //         "Boleto": {
    //             "pdf": "https:\/\/app.celcoin.com.br\/link-pdf",
    //             "bankLine": "23312323232323232323232323232"
    //         },
    //         "Pix": {
    //             "qrCode": "ABC123ABC123ABC123ABC123ABC123ABC123ABC123ABC123ABC123ABC123ABC123",
    //             "reference": "E20240603202152D264C5DFA354C6D4A7EEC09CCAAFC054",
    //             "image": "https:\/\/app.celcoin.com.br\/link-image-qrcode",
    //             "page": "https:\/\/app.celcoin.com.br\/link-page-qrcode"
    //         }
    //     },
    //     "Subscription": [
    //         {
    //             "myId": "pay-665e5010754766.56241224",
    //             "galaxPayId": 1,
    //             "planMyId": "pay-665e501091d958.65729046",
    //             "planGalaxPayId": 1,
    //             "value": 12999,
    //             "quantity": 12,
    //             "periodicity": "monthly",
    //             "firstPayDayDate": "2024-06-03",
    //             "paymentLink": "https:\/\/app.celcoin.com.br\/link-payment",
    //             "additionalInfo": "Lorem ipsum dolor sit amet.",
    //             "status": "active",
    //             "Customer": {
    //                 "galaxPayId": 1,
    //                 "myId": "pay-665e501127b8d3.98016121",
    //                 "name": "Lorem ipsum dolor sit amet.",
    //                 "document": "01697018246",
    //                 "emails": [
    //                     "teste8687email9315@galaxpay.com.br",
    //                     "teste1705email1588@galaxpay.com.br"
    //                 ],
    //                 "phones": [
    //                     3140201512,
    //                     31983890110
    //                 ],
    //                 "createdAt": "2020-06-02 10:10:00",
    //                 "updatedAt": "2020-06-02 10:10:00",
    //                 "Address": {
    //                     "zipCode": "30411330",
    //                     "street": "Rua platina",
    //                     "number": "1330",
    //                     "complement": "2º andar",
    //                     "neighborhood": "Prado",
    //                     "city": "Belo Horizonte",
    //                     "state": "MG"
    //                 }
    //             },
    //             "PaymentMethodCreditCard": {
    //                 "Card": {
    //                     "myId": "pay-665e501212cb95.52210086",
    //                     "galaxPayId": 1,
    //                     "number": "5451*********1515",
    //                     "createdAt": "2020-06-02 10:10:00",
    //                     "updatedAt": "2020-06-02 10:10:00",
    //                     "expiresAt": "2024-06"
    //                 }
    //             },
    //             "PaymentMethodBoleto": {
    //                 "fine": 100,
    //                 "interest": 200,
    //                 "instructions": "Lorem ipsum dolor sit amet."
    //             },
    //             "PaymentMethodPix": {
    //                 "fine": 100,
    //                 "interest": 200,
    //                 "instructions": "Lorem ipsum dolor sit amet.",
    //                 "Deadline": {
    //                     "type": "days",
    //                     "value": 60
    //                 }
    //             }
    //         }
    //     ]
    // }
  }
};

// webhook-galax-pay
