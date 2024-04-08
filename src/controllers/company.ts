import { RequestHandler } from "express";
import { readFileSync } from "fs";
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
} from "utils/validators";

export const createCompany: RequestHandler = async (req, res, next) => {
  try {
    const { user } = res.locals;
    const { name, cnpj, managerPartner, phone, address, monthlyDueDay } =
      req.body;

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

    const promises = [];
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
  creditLimit?: string;
  accountBankNumber?: string;
  accountNumber?: string;
  agencyNumber?: string;
  pixKey?: string;
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
        // salary.save({ session }),
        // role.save({ session }),
        // bankAccount.save({ session }),
        // employmentRelation.save({ session }),
        // user.save({ session }),
        // address ? address.save({ session }) : Promise.resolve(null),
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

// TODO
// export const createOrUpdateEmploymentRelation = async ({
//   company,
//   employeeData,
// }: {
//   company: Company & Document;
//   employeeData: IEmployeeData;
// }) => {
//   let address, bankAccount;
//   let user = (await UserModel.findOne({
//     cpf: employeeData.cpf,
//   })) as User & Document;
//   if (!user) {
//     ({ user, address } = createUser({ employeeData }));
//     console.log({ user, address, bankAccount });
//   }

//   const activeEmploymentRelation = user.activeEmploymentRelations.find(
//     (userActiveEmploymentRelation) =>
//       userActiveEmploymentRelation.company.toString() ===
//       company._id.toString(),
//   );
//   let employmentRelation, role, oldRole, salary, oldSalary;
//   if (!activeEmploymentRelation) {
//     role = new RoleModel({
//       title: employeeData.roleTitle,
//       field: employeeData.roleField,
//       startDate: employeeData.admissionDate,
//       activeSalary: employeeData.salary,
//       salaries: [],
//     });
//     bankAccount = new AccountModel({
//       bank: employeeData.accountBankNumber,
//       accountNumber: employeeData.accountNumber,
//       agencyNumber: employeeData.agencyNumber,
//       pixKey: employeeData.pixKey,
//       user: user._id,
//     });
//     employmentRelation = new EmploymentRelationModel({
//       admissionDate: employeeData.admissionDate,
//       company: company._id,
//       user: user._id,
//       roleHistory: [],
//       currentRole: role._id,
//       averageSalary12: employeeData.averageSalary12,
//       eligibleToCredit: employeeData.eligibleToCredit,
//       activeAccount: bankAccount._id,
//       accountHistory: [],
//       businessEmail: employeeData.corporateEmail,
//       creditLimit: employeeData.creditLimit,
//     });
//     user.accounts.push(bankAccount._id);
//     role.employmentRelation = employmentRelation._id;
//   } else {
//     const [currentBankAccount, currentRole] = await Promise.all([
//       AccountModel.findById(activeEmploymentRelation.activeAccount),
//       RoleModel.findById(activeEmploymentRelation.currentRole),
//     ]);
//     let changedActiveEmploymentRelation = false;
//     if (
//       !currentBankAccount ||
//       currentBankAccount.bank !== employeeData.accountBankNumber ||
//       currentBankAccount.accountNumber !== employeeData.accountNumber ||
//       currentBankAccount.agencyNumber !== employeeData.agencyNumber ||
//       currentBankAccount.pixKey !== employeeData.pixKey
//     ) {
//       bankAccount = new AccountModel({
//         bank: employeeData.accountBankNumber,
//         accountNumber: employeeData.accountNumber,
//         agencyNumber: employeeData.agencyNumber,
//         pixKey: employeeData.pixKey,
//         user: user._id,
//       });
//       activeEmploymentRelation.activeAccount = bankAccount._id;
//       changedActiveEmploymentRelation = true;
//       if (currentBankAccount) {
//         activeEmploymentRelation.accountHistory.push(
//           activeEmploymentRelation.activeAccount,
//         );
//       }
//     }

//     let changedRole = false;
//     if (
//       !currentRole ||
//       currentRole.title !== employeeData.roleTitle ||
//       currentRole.field !== employeeData.roleField
//     ) {
//       salary = new SalaryModel({
//         startDate: new Date(),
//         value: employeeData.salary,
//         employmentRelation: activeEmploymentRelation._id,
//       });
//       role = new RoleModel({
//         title: employeeData.roleTitle,
//         field: employeeData.roleField,
//         startDate: employeeData.admissionDate,
//         activeSalary: employeeData.salary,
//         salaries: [],
//       });
//       if (currentRole) {
//         activeEmploymentRelation.roleHistory.push(
//           activeEmploymentRelation.currentRole,
//         );
//         changedActiveEmploymentRelation = true;
//       }
//       activeEmploymentRelation.currentRole = role._id;
//       changedActiveEmploymentRelation = true;
//     } else {
//       const currentSalary = await SalaryModel.findById(
//         currentRole.activeSalary,
//       );
//       if (!currentSalary || currentSalary.value !== employeeData.salary) {
//         if (currentSalary) {
//           currentRole.salaries.push(currentSalary._id);
//           currentSalary.endDate = new Date();
//         }
//         salary = new SalaryModel({
//           startDate: new Date(),
//           value: employeeData.salary,
//           employmentRelation: activeEmploymentRelation._id,
//         });
//         currentRole.activeSalary = salary;
//       }
//     }
//   }
// };

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
      if (!data.length) return;
      const phone = parseAndValidatePhone({ phone: data[4].toString() });
      const cpf = parseAndValidateCPF({ cpf: data[6].toString() });
      const birthDate = parseAndValidateDate({ date: data[7].toString() });
      const admissionDate = parseAndValidateDate({ date: data[19].toString() });

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

      console.log({ data });

      const employee = {
        firstName: data[0].toLowerCase(),
        lastName: data[1].toLowerCase(),
        personalEmail: data[2].toLowerCase(),
        corporateEmail: data[3].toLowerCase(),
        phone: phone ? phone : "",
        birthState: data[5].toLowerCase(),
        cpf: cpf ? cpf : "",
        birthDate: birthDate ? birthDate : undefined,
        gender: data[8].toLowerCase(),
        maritalStatus: data[9].toLowerCase(),
        numberOfChildren: data[10],
        nacionality: data[11].toLowerCase(),
        postalCode: data[12],
        street: data[13].toLowerCase(),
        addressNumber: data[14] ? data[14].toString().toLowerCase() : "",
        addressLine2: data[15].toLowerCase(),
        neighborhood: data[16] ? data[16].toLowerCase() : "",
        city: data[17].toLowerCase(),
        state: data[18].toLowerCase(),
        admissionDate: admissionDate ? admissionDate : undefined,
        roleTitle: data[20].toLowerCase(),
        roleField: data[21].toLowerCase(),
        salary: data[22],
        averageSalary12: data[23],
        eligibleToCredit: data[36].toLowerCase() === "s" ? true : false,
        creditLimit: data[37],
        accountBankNumber: data[38],
        accountNumber: data[39],
        agencyNumber: data[40],
        pixKey: data[41].toString().toLowerCase(),
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

    const addedEmployees = [];

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

// interface Manager {
//   cpf: string;
//   address: {
//     postalCode: string;
//     street: string;
//     number: string;
//     addressLine2?: string;
//     neighborhood: string;
//     city: string;
//     state: string;
//   };
//   firstName: string;
//   lastName: string;
//   personalEmail: string;
//   phone: string;
//   nacionality: string;
//   birthDate: string;
//   gender: string;
//   maritalStatus: string;
//   numberOfChildren: string;
// }

// const putManager = async ({
//   manager,
//   companyId,
// }: {
//   manager: Manager;
//   companyId: Types.ObjectId;
// }): Promise<
//   Types.Subdocument<Types.ObjectId> & {
//     prototype?: unknown;
//     cacheHexString?: unknown;
//     generate?: any;
//     createFromTime?: any;
//     createFromHexString?: any;
//     createFromBase64?: any;
//     isValid?: any;
//   }
// > => {
//   let managerUser = (await UserModel.findOne({
//     cpf: manager.cpf,
//   })) as User & Document;
//   let newAddress: (Address & Document) | undefined;

//   if (!managerUser) {
//     newAddress = new AddressModel({
//       postalCode: manager.address.postalCode,
//       street: manager.address.street,
//       number: manager.address.number,
//       addressLine2: manager.address.addressLine2,
//       neighborhood: manager.address.neighborhood,
//       city: manager.address.city,
//       state: manager.address.state,
//     });
//     managerUser = new UserModel({
//       firstName: manager.firstName,
//       lastName: manager.lastName,
//       personalEmail: manager.personalEmail,
//       phone: manager.phone,
//       nacionality: manager.nacionality,
//       cpf: manager.cpf,
//       birthDate: manager.birthDate,
//       gender: manager.gender,
//       maritalStatus: manager.maritalStatus,
//       numberOfChildren: manager.numberOfChildren,
//       address: newAddress._id,
//       userType: UserType.DEFAULT,
//       managedCompanies: [
//         {
//           company: companyId,
//           active: true,
//           history: [
//             {
//               active: true,
//               timestamp: new Date().valueOf(),
//             },
//           ],
//         },
//       ],
//     });
//     newAddress.user = managerUser._id;
//   } else {
//     const managerAddress = (await AddressModel.findById(
//       managerUser.address,
//     )) as Address & Document;
//     if (
//       !managerAddress ||
//       managerAddress.postalCode !== manager.address.postalCode ||
//       managerAddress.street !== manager.address.street ||
//       managerAddress.number !== manager.address.number ||
//       managerAddress.addressLine2 !== manager.address.addressLine2 ||
//       managerAddress.neighborhood !== manager.address.neighborhood ||
//       managerAddress.city !== manager.address.city ||
//       managerAddress.state !== manager.address.state
//     ) {
//       managerUser.addresses.push(managerAddress._id);
//       newAddress = new AddressModel({
//         postalCode: manager.address.postalCode,
//         street: manager.address.street,
//         number: manager.address.number,
//         addressLine2: manager.address.addressLine2,
//         neighborhood: manager.address.neighborhood,
//         city: manager.address.city,
//         state: manager.address.state,
//         user: managerUser._id,
//       });
//       managerUser.address = newAddress._id;
//     }
//     managerUser.firstName = manager.firstName;
//     managerUser.lastName = manager.lastName;
//     managerUser.personalEmail = manager.personalEmail;
//     managerUser.phone = manager.phone;
//     managerUser.nacionality = manager.nacionality;
//     managerUser.cpf = manager.cpf;
//     managerUser.birthDate = manager.birthDate;
//     managerUser.gender = manager.gender;
//     managerUser.maritalStatus = manager.maritalStatus;
//     managerUser.numberOfChildren = manager.numberOfChildren;
//     if (
//       !managerUser.managedCompanies.find((managedCompany) => {
//         if (managedCompany.company.toString() === companyId.toString()) {
//           if (!managedCompany.active) {
//             managedCompany.history.push({
//               active: false,
//               timestamp: new Date().valueOf(),
//             });
//             managedCompany.active = true;
//           }
//           return true;
//         }
//       })
//     )
//       managerUser.managedCompanies.push({
//         company: companyId,
//         active: true,
//         history: [
//           {
//             active: true,
//             timestamp: new Date().valueOf,
//           },
//         ],
//       });
//   }
//   const promises = [];
//   if (newAddress) {
//     promises.push(newAddress.save());
//   }

//   const [updatedManager] = await Promise.all([managerUser.save(), ...promises]);
//   return updatedManager._id;
// };

// export const addOrUpdateManagers: RequestHandler = async (req, res, next) => {
//   try {
//     const { companyId } = req.params;
//     const { userId, newManagers }: { userId: string; newManagers: Manager[] } =
//       req.body;
//     const [company, user] = (await Promise.all([
//       CompanyModel.findById(companyId),
//       UserModel.findById(userId),
//     ])) as [Company & Document, User & Document];
//     if (!company) {
//       throw new CustomError("Company not found", 404);
//     }
//     if (!user) {
//       throw new CustomError("User not found", 404);
//     }
//     if (company.managerPartner?.toString() !== userId) {
//       throw new CustomError("Unauthorized", 401);
//     }

//     const managersIds = await Promise.all(
//       newManagers.map((manager) =>
//         putManager({ manager, companyId: company._id }),
//       ),
//     );

//     managersIds.forEach((managerId) => {
//       if (
//         !company.managers.find((manager) => {
//           if (manager.manager.toString() === managerId.toString()) {
//             if (!manager.active) {
//               manager.history.push({
//                 active: false,
//                 timestamp: new Date().valueOf(),
//               });
//               manager.active = true;
//             }
//             return true;
//           }
//         })
//       ) {
//         company.managers.push(managerId);
//       }
//     });

//     // company.managers = company.managers.concat(
//     //   managersIds,
//     // ) as Types.DocumentArray<{
//     //   prototype?: unknown;
//     //   cacheHexString?: unknown;
//     //   generate?: any;
//     //   createFromTime?: any;
//     //   createFromHexString?: any;
//     //   createFromBase64?: any;
//     //   isValid?: any;
//     // }>;
//   } catch (err) {
//     next(err);
//   }
// };

// export const putManagers: RequestHandler = async (req, res, next) => {
//   try {
//     const { companyId } = req.params;
//     const { userId, newManagers }: { userId: string; newManagers: Manager[] } =
//       req.body;
//     const [company, user] = (await Promise.all([
//       CompanyModel.findById(companyId),
//       UserModel.findById(userId),
//     ])) as [Company & Document, User & Document];
//     if (!company) {
//       throw new CustomError("Company not found", 404);
//     }
//     if (!user) {
//       throw new CustomError("User not found", 404);
//     }
//     if (company.managerPartner?.toString() !== userId) {
//       throw new CustomError("Unauthorized", 401);
//     }

//     const managersIds = await Promise.all(
//       newManagers.map((manager) =>
//         putManager({ manager, companyId: company._id }),
//       ),
//     );

//     managersIds.forEach((managerId) => {
//       if (
//         !company.managers.find(
//           (manager) => manager.toString() === managerId.toString(),
//         )
//       ) {
//         company.managers.push(managerId);
//       }
//     });

//     company.managers = company.managers.concat(
//       managersIds,
//     ) as Types.DocumentArray<{
//       prototype?: unknown;
//       cacheHexString?: unknown;
//       generate?: any;
//       createFromTime?: any;
//       createFromHexString?: any;
//       createFromBase64?: any;
//       isValid?: any;
//     }>;
//   } catch (err) {
//     next(err);
//   }
// };

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
