import { InferSchemaType, model, Schema, Types } from "mongoose";
import { IRole } from "./role";
import { IAccount } from "./account";

const employmentRelationSchema = new Schema(
  {
    admissionDate: { type: Date },
    terminationDate: { type: Date },
    company: {
      type: Types.ObjectId,
      ref: "Company",
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
    },
    roleHistory: [
      {
        type: Types.ObjectId,
        ref: "Role",
      },
    ],
    currentRole: {
      type: Types.ObjectId,
      ref: "Role",
    },
    averageSalary12: {
      type: Number,
    },
    eligibleToCredit: {
      type: Boolean,
    },
    activeAccount: {
      type: Types.ObjectId,
      ref: "Account",
    },
    accountHistory: [
      {
        type: Types.ObjectId,
        ref: "Account",
      },
    ],
    businessEmail: {
      type: String,
    },
    creditLimit: {
      type: Number,
    },
    celcoinEmploymentRelationId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

type EmploymentRelation = InferSchemaType<typeof employmentRelationSchema>;

export interface IEmploymentRelation {
  admissionDate: Date;
  terminationDate: Date;
  company: Types.ObjectId;
  user: Types.ObjectId;
  roleHistory: Types.ObjectId[];
  currentRole: IRole;
  averageSalary12: number;
  eligibleToCredit: boolean;
  activeAccount: IAccount;
  accountHistory: Types.ObjectId[];
  businessEmail: string;
  creditLimit: number;
  celcoinEmploymentRelationId: string;
}

const EmploymentRelationModel = model(
  "EmploymentRelation",
  employmentRelationSchema,
);

export { EmploymentRelation, EmploymentRelationModel };
