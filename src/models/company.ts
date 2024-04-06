import { InferSchemaType, model, Schema, Types } from "mongoose";

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
  },
  { timestamps: true },
);

type Company = InferSchemaType<typeof companySchema>;

const CompanyModel = model("Company", companySchema);

export { Company, CompanyModel };
