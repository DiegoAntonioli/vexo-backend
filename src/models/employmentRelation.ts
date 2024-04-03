import { InferSchemaType, model, Schema, Types } from "mongoose";

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
  },
  { timestamps: true },
);

type EmploymentRelation = InferSchemaType<typeof employmentRelationSchema>;

const EmploymentRelationModel = model(
  "EmploymentRelation",
  employmentRelationSchema,
);

export { EmploymentRelation, EmploymentRelationModel };
