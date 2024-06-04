import { InferSchemaType, model, Schema, Types } from "mongoose";
import { IAddress } from "./address";
import { IPopulatedAddressUser } from "./user";

const companySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    cnpj: {
      type: String,
      index: true,
      required: true,
    },
    managerPartner: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    managerPartnerStartTimestamp: {
      type: Number,
      required: true,
    },
    managerPartnerHistory: [
      {
        managerPartner: {
          type: Types.ObjectId,
          ref: "User",
          required: true,
        },
        startTimestamp: {
          type: Number,
        },
        endTimestamp: {
          type: Number,
        },
      },
    ],
    managers: [
      {
        manager: {
          type: Types.ObjectId,
          ref: "User",
        },
        active: {
          type: Boolean,
          default: true,
        },
        history: [
          {
            active: {
              type: Boolean,
            },
            timestamp: {
              type: Number,
            },
          },
        ],
      },
    ],
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: Types.ObjectId,
      ref: "Address",
      required: true,
    },
    employees: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
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
    monthlyDueDay: {
      type: Number,
      required: true,
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
        required: true,
      },
      key: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true },
);

type Company = InferSchemaType<typeof companySchema>;

export interface IPopulatedAddressCompany {
  name: string;
  cnpj: string;
  managerPartner: IPopulatedAddressUser;
  managerPartnerStartTimestamp: number;
  managerPartnerHistory: {
    managerPartner: Types.ObjectId;
    startTimestamp: number;
    endTimestamp: number;
  }[];
  managers: {
    manager: Types.ObjectId;
    active: boolean;
    history: {
      active: boolean;
      timestamp: number;
    }[];
  }[];
  phone: string;
  address: IAddress;
  employees: Types.ObjectId[];
  employmentRelationHistory: Types.ObjectId[];
  activeEmploymentRelations: Types.ObjectId[];
  monthlyDueDay: number;
  celcoinAccountId: string;
  celcashAccountId: string;
  celcoinCreditLineId: string;
  pix: {
    keyType: string;
    key: string;
  };
}

const CompanyModel = model("Company", companySchema);

export { Company, CompanyModel };
