import { RequestHandler } from "express";
import { readFileSync } from "fs";
import {
  cancelPaymentSlip,
  createPaymentSlip,
  getOpenInstallments,
} from "helpers/celcoin";
import { Account, AccountModel } from "models/account";
import { Address, AddressModel } from "models/address";
import { Company, CompanyModel } from "models/company";
import {
  EmploymentRelation,
  EmploymentRelationModel,
} from "models/employmentRelation";
import { Role, RoleModel } from "models/role";
import { Salary, SalaryModel } from "models/salary";
import { UserType } from "models/types";
import { User, UserModel } from "models/user";
import mongoose, { Document, Types } from "mongoose";
import { parse } from "node-xlsx";
import path from "path";
import { CustomError } from "utils/error";
import {
  parseAndValidateCPF,
  parseAndValidateDate,
  parseAndValidatePhone,
  parseNumber,
} from "utils/validators";

export const createCompany: RequestHandler = async (req, res, next) => {
  try {
    const { user } = res.locals;
    const {
      name,
      cnpj,
      managerPartner,
      phone,
      address,
      monthlyDueDay,
      pixKey,
      pixType,
    } = req.body;
    console.log({
      name,
      cnpj,
      managerPartner,
      phone,
      address,
      monthlyDueDay,
      pixKey,
      pixType,
    });
    if (!user || user.userType !== UserType.ADMIN) {
      throw new CustomError("Unauthorized", 401);
    }

    const company = await CompanyModel.findOne({ cnpj });

    if (company) {
      throw new CustomError("Company already registered", 409);
    }

    let managerPartnerUser = (await UserModel.findOne({
      cpf: managerPartner.cpf,
    })) as User & Document;

    let newAddress: (Address & Document) | undefined;

    // email corporativo
    if (!managerPartnerUser) {
      newAddress = new AddressModel({
        postalCode: managerPartner.address.postalCode,
        street: managerPartner.address.street.toLowerCase(),
        number: managerPartner.address.number.toLowerCase(),
        addressLine2: managerPartner.address.addressLine2.toLowerCase(),
        neighborhood: managerPartner.address.neighborhood.toLowerCase(),
        city: managerPartner.address.city.toLowerCase(),
        state: managerPartner.address.state.toLowerCase(),
      });
      managerPartnerUser = new UserModel({
        firstName: managerPartner.firstName.toLowerCase(),
        lastName: managerPartner.lastName.toLowerCase(),
        personalEmail: managerPartner.personalEmail.toLowerCase(),
        phone: managerPartner.phone.toLowerCase(),
        nacionality: managerPartner.nacionality.toLowerCase(),
        cpf: managerPartner.cpf,
        birthDate: managerPartner.birthDate,
        gender: managerPartner.gender.toLowerCase(),
        maritalStatus: managerPartner.maritalStatus.toLowerCase(),
        numberOfChildren: managerPartner.numberOfChildren,
        address: newAddress._id,
        userType: UserType.DEFAULT,
      });
      newAddress.user = managerPartnerUser._id;
    } else {
      const managerPartnerAddress = (await AddressModel.findById(
        managerPartnerUser.address,
      )) as Address & Document;
      if (
        !managerPartnerAddress ||
        managerPartnerAddress.postalCode !==
          managerPartner.address.postalCode ||
        managerPartnerAddress.street !== managerPartner.address.street ||
        managerPartnerAddress.number !== managerPartner.address.number ||
        managerPartnerAddress.addressLine2 !==
          managerPartner.address.addressLine2 ||
        managerPartnerAddress.neighborhood !==
          managerPartner.address.neighborhood ||
        managerPartnerAddress.city !== managerPartner.address.city ||
        managerPartnerAddress.state !== managerPartner.address.state
      ) {
        managerPartnerUser.addresses.push(managerPartnerAddress._id);
        newAddress = new AddressModel({
          postalCode: managerPartner.address.postalCode,
          street: managerPartner.address.street.toLowerCase(),
          number: managerPartner.address.number.toLowerCase(),
          addressLine2: managerPartner.address.addressLine2.toLowerCase(),
          neighborhood: managerPartner.address.neighborhood.toLowerCase(),
          city: managerPartner.address.city.toLowerCase(),
          state: managerPartner.address.state.toLowerCase(),
          user: managerPartnerUser._id,
        });
        managerPartnerUser.address = newAddress._id;
      }
      managerPartnerUser.firstName = managerPartner.firstName.toLowerCase();
      managerPartnerUser.lastName = managerPartner.lastName.toLowerCase();
      managerPartnerUser.personalEmail =
        managerPartner.personalEmail.toLowerCase();
      managerPartnerUser.phone = managerPartner.phone;
      managerPartnerUser.nacionality = managerPartner.nacionality.toLowerCase();
      managerPartnerUser.cpf = managerPartner.cpf;
      managerPartnerUser.birthDate = managerPartner.birthDate;
      managerPartnerUser.gender = managerPartner.gender.toLowerCase();
      managerPartnerUser.maritalStatus =
        managerPartner.maritalStatus.toLowerCase();
      managerPartnerUser.numberOfChildren = managerPartner.numberOfChildren;
    }

    const newCompanyAddress: Address & Document = new AddressModel({
      postalCode: address.postalCode,
      street: address.street.toLowerCase(),
      number: address.number.toLowerCase(),
      addressLine2: address.addressLine2.toLowerCase(),
      neighborhood: address.neighborhood.toLowerCase(),
      city: address.city.toLowerCase(),
      state: address.state.toLowerCase(),
    });

    const newCompany: Company & Document = new CompanyModel({
      name: name.toLowerCase(),
      cnpj,
      managerPartner: managerPartnerUser._id,
      managerPartnerStartTimestamp: new Date().valueOf(),
      phone,
      address: newCompanyAddress._id,
      monthlyDueDay,
      pix: { key: pixKey, keyType: pixType },
    });

    console.log({
      name: name.toLowerCase(),
      cnpj,
      managerPartner: managerPartnerUser._id,
      managerPartnerStartTimestamp: new Date().valueOf(),
      phone,
      address: newCompanyAddress._id,
      monthlyDueDay,
      pix: { key: pixKey, keyType: pixType },
    });
    newCompanyAddress.company = newCompany._id;
    managerPartnerUser.managerPartnerCompanies.push({
      company: newCompany._id,
      active: true,
      history: [
        {
          active: true,
          timestamp: new Date().valueOf(),
        },
      ],
    });

    const promises: Promise<Document & Address>[] = [];
    if (newAddress) {
      promises.push(newAddress.save());
    }

    // const session = await mongoose.startSession();
    // session.startTransaction();

    const [savedManagerPartner, savedCompany] = await Promise.all([
      managerPartnerUser.save(),
      newCompany.save(),
      newCompanyAddress.save(),
      // managerPartnerUser.save({ session }),
      // newCompany.save({ session }),
      // newCompanyAddress.save({ session }),
      ...promises,
    ]);
    res.status(201).json({
      OK: "OK",
      managerPartnerId: savedManagerPartner._id.toString(),
      newCompanyId: savedCompany._id.toString(),
    });
  } catch (err) {
    next(err);
  }
};

export const getCompany: RequestHandler = async (req, res, next) => {
  try {
    const { company } = res.locals;
    console.log({ company });
    res.status(200).json({ OK: "OK", company });
  } catch (err) {
    next(err);
  }
};

interface IEmployeeData {
  firstName: string;
  lastName: string;
  personalEmail?: string;
  corporateEmail?: string;
  phone?: string;
  birthState?: string;
  cpf: string;
  birthDate?: Date;
  gender?: string;
  maritalStatus?: string;
  numberOfChildren?: string;
  nacionality?: string;
  postalCode?: string;
  street?: string;
  addressNumber?: string;
  addressLine2?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  admissionDate?: Date;
  roleTitle?: string;
  roleField?: string;
  salary?: string;
  averageSalary12?: string;
  eligibleToCredit?: boolean;
  creditLimit?: number;
  accountBankNumber?: number;
  accountNumber?: string;
  agencyNumber?: number;
  pixKey?: string;
  pixType?: string;
  dataIndex: number;
}
// "managerPartnerId": "66105ace4b43028bc48c7ac1",
// "newCompanyId": "66105ace4b43028bc48c7ac3"
export const createEmploymentRelation = async ({
  company,
  employeeData,
}: {
  company: Company & Document;
  employeeData: IEmployeeData;
}): Promise<{
  salary: (Salary & Document) | null;
  role: (Role & Document) | null;
  bankAccount: (Account & Document) | null;
  employmentRelation: (EmploymentRelation & Document) | null;
  user: (User & Document) | null;
  address: (Address & Document) | null;
  error: CustomError | null;
}> => {
  try {
    let address: (Address & Document) | null;
    // const session = await mongoose.startSession();
    // session.startTransaction();
    // let user = await UserModel.findOne({
    //   cpf: employeeData.cpf,
    // }).session(session);
    let user = await UserModel.findOne({
      cpf: employeeData.cpf,
    });

    if (!user) {
      user = new UserModel({
        cpf: employeeData.cpf,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        personalEmail: employeeData.personalEmail,
        phone: employeeData.phone,
        nacionality: employeeData.nacionality,
        birthState: employeeData.birthState,
        birthDate: employeeData.birthDate,
        gender: employeeData.gender,
        maritalStatus: employeeData.maritalStatus,
        numberOfChildren: employeeData.numberOfChildren,
        userType: UserType.DEFAULT,
        activeEmploymentRelations: [],
      });
      address = new AddressModel({
        postalCode: employeeData.postalCode,
        street: employeeData.street,
        number: employeeData.addressNumber,
        addressLine2: employeeData.addressLine2,
        neighborhood: employeeData.neighborhood,
        city: employeeData.city,
        state: employeeData.state,
        user: user._id,
      });
      user.address = address._id;

      console.log({ user, address });
    } else {
      address = null;
    }

    const activeEmploymentRelation = user.activeEmploymentRelations.find(
      (userActiveEmploymentRelation) =>
        userActiveEmploymentRelation.company.toString() ===
        company._id.toString(),
    );
    if (!activeEmploymentRelation) {
      const salary = new SalaryModel({
        startDate: employeeData.admissionDate,
        value: employeeData.salary,
      });
      const role = new RoleModel({
        title: employeeData.roleTitle,
        field: employeeData.roleField,
        startDate: employeeData.admissionDate,
        activeSalary: salary._id,
        salaries: [],
      });
      const bankAccount = new AccountModel({
        bank: employeeData.accountBankNumber,
        accountNumber: employeeData.accountNumber,
        agencyNumber: employeeData.agencyNumber,
        pixKey: employeeData.pixKey,
        pixType: employeeData.pixType,
        user: user._id,
      });
      const employmentRelation = new EmploymentRelationModel({
        admissionDate: employeeData.admissionDate,
        company: company._id,
        user: user._id,
        roleHistory: [],
        currentRole: role._id,
        averageSalary12: employeeData.averageSalary12,
        eligibleToCredit: employeeData.eligibleToCredit,
        activeAccount: bankAccount._id,
        accountHistory: [],
        businessEmail: employeeData.corporateEmail,
        creditLimit: employeeData.creditLimit,
      });
      user.accounts.push(bankAccount._id);
      user.activeEmploymentRelations.push({
        employmentRelation: employmentRelation._id,
        company: company._id,
      });
      role.employmentRelation = employmentRelation._id;
      await Promise.all([
        salary.save(),
        role.save(),
        bankAccount.save(),
        employmentRelation.save(),
        user.save(),
        address ? address.save() : Promise.resolve(null),
      ]);
      // await session.commitTransaction();
      // await session.endSession();
      return {
        salary,
        role,
        bankAccount,
        employmentRelation,
        user,
        address,
        error: null,
      };
    } else {
      return {
        salary: null,
        role: null,
        bankAccount: null,
        employmentRelation: null,
        user: null,
        address: null,
        error: new CustomError("employment relation already registered", 409),
      };
    }
  } catch (err) {
    if (err instanceof CustomError) {
      return {
        salary: null,
        role: null,
        bankAccount: null,
        employmentRelation: null,
        user: null,
        address: null,
        error: err,
      };
    } else if (err instanceof Error) {
      return {
        salary: null,
        role: null,
        bankAccount: null,
        employmentRelation: null,
        user: null,
        address: null,
        error: new CustomError(err.message, 500, { err }),
      };
    } else {
      return {
        salary: null,
        role: null,
        bankAccount: null,
        employmentRelation: null,
        user: null,
        address: null,
        error: new CustomError("Something Happened", 500, { err }),
      };
    }
  }
};

export const registerCompanyEmployees: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const { company, user } = res.locals;

    if (
      company.managerPartner?.toString() !== user._id.toString() &&
      user.userType !== UserType.ADMIN
    ) {
      throw new CustomError("Unauthorized", 401);
    }

    const workSheets = parse(
      readFileSync(path.join(__dirname, "..", "sheetSample.xlsx")),
    );
    console.log({ workSheets });

    const workSheetsData = workSheets[0].data;

    const employees: IEmployeeData[] = [];
    const errorsData: {
      message: string;
      cpf: string;
      index: number;
    }[] = [];
    const employeesCPF: { [key: string]: number } = {};

    workSheetsData.slice(1).forEach((data, index) => {
      if (!data.length || !data[4]) return;
      console.log({ data });
      const phone = parseAndValidatePhone({ phone: data[4].toString() });
      const cpf = parseAndValidateCPF({ cpf: data[6].toString() });
      const birthDate = parseAndValidateDate({ date: data[7].toString() });
      const admissionDate = parseAndValidateDate({ date: data[19].toString() });
      const postalCode = parseNumber({ number: data[12] });
      const creditLimit = parseNumber({ number: data[37] });
      const accountBankNumber = parseNumber({ number: data[38] });
      const accountNumber = parseNumber({ number: data[39] });
      const agencyNumber = parseNumber({ number: data[40] });

      if (!cpf) {
        errorsData.push({
          message: "invalid CPF",
          cpf: data[6],
          index,
        });
        return;
      }

      if (employeesCPF.cpf) {
        errorsData.push({
          message: "duplicated CPF",
          cpf: data[6],
          index,
        });
        return;
      }

      console.log({ data, phone });

      const employee = {
        firstName: data[0] ? data[0].toLowerCase().trim() : "",
        lastName: data[1] ? data[1].toLowerCase().trim() : "",
        personalEmail: data[2] ? data[2].toLowerCase().trim() : "",
        corporateEmail: data[3] ? data[3].toLowerCase().trim() : "",
        phone: phone ? phone : "",
        birthState: data[5] ? data[5].toLowerCase().trim() : "",
        cpf: cpf ? cpf : "",
        birthDate: birthDate ? birthDate : undefined,
        gender: data[8] ? data[8].toLowerCase().trim() : "",
        maritalStatus: data[9] ? data[9].toLowerCase().trim() : "",
        numberOfChildren: data[10],
        nacionality: data[11] ? data[11].toLowerCase().trim() : "",
        postalCode: postalCode ? postalCode : undefined,
        street: data[13] ? data[13].toLowerCase().trim() : "",
        addressNumber: data[14] ? data[14].toString().toLowerCase().trim() : "",
        addressLine2: data[15] ? data[15].toLowerCase().trim() : "",
        neighborhood: data[16] ? data[16].toLowerCase().trim() : "",
        city: data[17] ? data[17].toLowerCase().trim() : "",
        state: data[18] ? data[18].toLowerCase().trim() : "",
        admissionDate: admissionDate ? admissionDate : undefined,
        roleTitle: data[20] ? data[20].toLowerCase().trim() : "",
        roleField: data[21] ? data[21].toLowerCase().trim() : "",
        salary: data[22],
        averageSalary12: data[23],
        eligibleToCredit: data[36]
          ? data[36].toLowerCase().trim() === "s"
            ? true
            : false
          : false,
        creditLimit: creditLimit ? parseInt(creditLimit) : 0,
        accountBankNumber: accountBankNumber ? parseInt(accountBankNumber) : 0,
        accountNumber: accountNumber ? accountNumber : "",
        agencyNumber: agencyNumber ? parseInt(agencyNumber) : 0,
        pixKey: data[41] ? data[41].toString().toLowerCase().trim() : "",
        pixType: data[42] ? data[42].toString().toLowerCase().trim() : "",
        dataIndex: index,
      };
      console.log({ employee });
      employees.push(employee);
    });

    const savedEmployeeData: {
      salary: Types.ObjectId;
      role: Types.ObjectId;
      bankAccount: Types.ObjectId;
      employmentRelation: Types.ObjectId;
      user: Types.ObjectId;
      address: Types.ObjectId;
    }[] = [];

    const addedEmployees: string[] = [];

    for (const employeeData of employees) {
      const {
        salary,
        role,
        bankAccount,
        employmentRelation,
        user,
        address,
        error,
      } = await createEmploymentRelation({
        company,
        employeeData,
      });
      if (error) {
        errorsData.push({
          message: error.message,
          cpf: employeeData.cpf,
          index: employeeData.dataIndex,
        });
      } else if (
        salary &&
        role &&
        bankAccount &&
        employmentRelation &&
        user &&
        address
      ) {
        company.activeEmploymentRelations.push(employmentRelation._id);

        addedEmployees.push(employmentRelation._id);
        savedEmployeeData.push({
          salary: salary._id,
          role: role._id,
          bankAccount: bankAccount._id,
          employmentRelation: employmentRelation._id,
          user: user._id,
          address: address._id,
        });
      }
    }

    await company.save();

    res.status(201).json({ OK: "OK", errorsData, savedEmployeeData });
  } catch (err) {
    console.log({ err });
    next(err);
  }
};

export const validateCompany: RequestHandler = async (req, res, next) => {
  try {
    const { companyName } = req.params;

    const company = await CompanyModel.findOne({
      name: companyName.toLowerCase(),
    });

    res
      .status(200)
      .json({ OK: "OK", companyRegistered: company ? true : false });
  } catch (err) {
    next(err);
  }
};

export const getCompanyInstallmentsHandler: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const { companyId } = req.params;
    // const { installmentIds } = req.body;
    const { year, month } = req.query;
    const result = await getOpenInstallments({
      companyId,
      year: year && typeof year == "string" ? year : undefined,
      month: month && typeof month == "string" ? month : undefined,
    });
    console.log({ result });
    res.status(200).json({ result });
  } catch (err) {
    next(err);
  }
};

export const createPaymentSlipHandler: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const { companyId } = req.params;
    const { installmentIds } = req.body;
    const result = await createPaymentSlip({ companyId, installmentIds });
    res.status(200).json({ result });
  } catch (err) {
    next(err);
  }
};

export const cancelPaymentSlipHandler = async (req, res, next) => {
  try {
    const { paymentSlipId } = req.params;
    const result = await cancelPaymentSlip({ paymentSlipId });
    res.status(200).json({ result });
  } catch (err) {
    next(err);
  }
};
