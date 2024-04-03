import { InferSchemaType, model, Schema, Types } from "mongoose";

enum UserType {
  ADMIN = "admin",
  SUPPORT = "support",
  DEFAULT = "default",
}

const userSchema = new Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    personalEmail: {
      type: String,
    },
    phone: {
      type: String,
    },
    nacionality: {
      type: String,
    },
    CPF: {
      type: String,
      index: true,
    },
    birthday: {
      type: Date,
    },
    gender: {
      type: String,
    },
    civilStatus: {
      type: String,
    },
    children: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    spouse: {
      type: Types.ObjectId,
      ref: "User",
    },
    address: {
      type: Types.ObjectId,
      ref: "Address",
    },
    employmentRelationHistory: [
      {
        type: Types.ObjectId,
        ref: "EmploymentRelation",
      },
    ],
    activeEmploymentRelations: [
      {
        type: Types.ObjectId,
        ref: "EmploymentRelation",
      },
    ],
    accounts: [
      {
        type: Types.ObjectId,
        ref: "Account",
      },
    ],
    loanAgreements: [
      {
        type: Types.ObjectId,
        ref: "LoanAgreement",
      },
    ],
    companies: [
      {
        type: Types.ObjectId,
        ref: "Company",
      },
    ],
    type: { type: String, enum: Object.values(UserType) },

    signatures: [
      {
        type: Types.ObjectId,
        ref: "Signature",
      },
    ],
  },
  { timestamps: true },
);

type User = InferSchemaType<typeof userSchema>;

const UserModel = model("User", userSchema);

export { User, UserModel };
