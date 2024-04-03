import { InferSchemaType, model, Schema, Types } from "mongoose";

const companySchema = new Schema(
  {
    name: {
      type: String,
    },
    CNPJ: {
      type: String,
    },
    managerPartner: {
      type: Types.ObjectId,
      ref: "User",
    },
    managers: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    phone: {
      type: String,
    },
    address: {
      type: Types.ObjectId,
      ref: "Address",
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
    },
  },
  { timestamps: true },
);

type Company = InferSchemaType<typeof companySchema>;

const CompanyModel = model("Company", companySchema);

export { Company, CompanyModel };
