import { InferSchemaType, model, Schema, Types } from "mongoose";
import { UserType } from "./types";

const userSchema = new Schema(
  {
    cpf: {
      type: String,
      index: true,
    },
    hashedPassword: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    personalEmail: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerificationCode: {
      type: String,
      default: "",
    },
    nacionality: {
      type: String,
    },
    birthState: {
      type: String,
    },
    birthDate: {
      type: Date,
    },
    gender: {
      type: String,
    },
    maritalStatus: {
      type: String,
    },
    numberOfChildren: {
      type: Number,
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
    addresses: [
      {
        type: Types.ObjectId,
        ref: "Address",
      },
    ],
    address: {
      type: Types.ObjectId,
      ref: "Address",
    },
    employmentRelationHistory: [
      {
        employmentRelation: {
          type: Types.ObjectId,
          ref: "EmploymentRelation",
        },
        company: {
          type: Types.ObjectId,
          ref: "Company",
        },
      },
    ],
    activeEmploymentRelations: [
      {
        employmentRelation: {
          type: Types.ObjectId,
          ref: "EmploymentRelation",
        },
        company: {
          type: Types.ObjectId,
          ref: "Company",
        },
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
    managerPartnerCompanies: [
      {
        company: {
          type: Types.ObjectId,
          ref: "Company",
        },
        active: {
          type: Boolean,
          default: true,
        },
        history: [
          {
            active: {
              type: Boolean,
              default: true,
            },
            timestamp: {
              type: Number,
            },
          },
        ],
      },
    ],
    managedCompanies: [
      {
        company: {
          type: Types.ObjectId,
          ref: "Company",
        },
        active: {
          type: Boolean,
          default: true,
        },
        history: [
          {
            active: {
              type: Boolean,
              default: true,
            },
            timestamp: {
              type: Number,
            },
          },
        ],
      },
    ],
    userType: { type: String, enum: Object.values(UserType) },
    signatures: [
      {
        type: Types.ObjectId,
        ref: "Signature",
      },
    ],
    optIn: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

type User = InferSchemaType<typeof userSchema>;

const UserModel = model("User", userSchema);

export { User, UserModel };
