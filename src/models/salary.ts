import { InferSchemaType, model, Schema, Types } from "mongoose";

const salarySchema = new Schema(
  {
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    value: {
      type: Number,
    },
    employmentRelation: {
      type: Types.ObjectId,
      ref: "EmploymentRelation",
    },
  },
  { timestamps: true },
);

type Salary = InferSchemaType<typeof salarySchema>;

const SalaryModel = model("Salary", salarySchema);

export { Salary, SalaryModel };
