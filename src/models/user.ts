import { InferSchemaType, model, Schema, Types } from "mongoose";
import { UserType } from "./types";
import { IAddress } from "./address";

const userSchema = new Schema(
  {
    cpf: {
      type: String,
      index: true,
    },
    rg: {
      rgNumber: {
        type: String,
      },
      rgIssuer: {
        type: String,
      },
      rgIssueDate: {
        type: String,
      },
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
    // 5bf9bb6f-46fb-4ea2-9790-3ba736fb023e
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
    finishedRegistration: {
      type: Boolean,
      default: false,
    },
    celcoinAccountId: {
      type: String,
      default: "",
    },
    celcashAccountId: {
      type: String,
      default: "",
    },
    celcoinCreditLineId: {
      type: String,
      default: "",
    },
    pix: {
      keyType: {
        type: String,
      },
      key: {
        type: String,
      },
    },
  },
  { timestamps: true },
);

type User = InferSchemaType<typeof userSchema>;

export interface IPopulatedAddressUser {
  cpf: string;
  rg: {
    rgNumber: string;
    rgIssuer: string;
    rgIssueDate: string;
  };
  hashedPassword: string;
  firstName: string;
  lastName: string;
  personalEmail: string;
  emailVerified: boolean;
  emailVerificationCode: string;
  phone: string;
  phoneVerified: boolean;
  phoneVerificationCode: string;
  nacionality: string;
  birthState: string;
  birthDate: Date;
  gender: string;
  maritalStatus: string;
  numberOfChildren: number;
  children: Types.ObjectId[];
  spouse: Types.ObjectId;
  addresses: Types.ObjectId[];
  address: IAddress;
  employmentRelationHistory: {
    employmentRelation: Types.ObjectId;
    company: Types.ObjectId;
  }[];
  activeEmploymentRelations: {
    employmentRelation: Types.ObjectId;
    company: Types.ObjectId;
  }[];
  accounts: Types.ObjectId[];
  loanAgreements: Types.ObjectId[];
  managerPartnerCompanies: {
    company: Types.ObjectId;
    active: boolean;
    history: {
      active: boolean;
      timestamp: number;
    }[];
  }[];
  managedCompanies: {
    company: Types.ObjectId;
    active: boolean;
    history: {
      active: boolean;
      timestamp: number;
    }[];
  }[];
  userType: string;
  signatures: Types.ObjectId[];
  optIn: boolean;
  finishedRegistration: boolean;
  celcoinAccountId: string;
  celcashAccountId: string;
  celcoinCreditLineId: string;
  pix: {
    keyType: string;
    key: string;
  };
}

const UserModel = model("User", userSchema);

export { User, UserModel };
