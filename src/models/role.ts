import { InferSchemaType, model, Schema, Types } from "mongoose";

const roleSchema = new Schema(
  {
    title: {
      type: String,
    },
    field: {
      type: String,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    activeSalary: {
      type: Types.ObjectId,
      ref: "Salary",
    },
    salaries: [
      {
        type: Types.ObjectId,
        ref: "Salary",
      },
    ],
    employmentRelation: {
      type: Types.ObjectId,
      ref: "EmploymentRelation",
    },
  },
  { timestamps: true },
);

type Role = InferSchemaType<typeof roleSchema>;

const RoleModel = model("Role", roleSchema);

export { Role, RoleModel };
