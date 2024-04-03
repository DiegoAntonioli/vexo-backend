import { InferSchemaType, model, Schema, Types } from "mongoose";

const bankSchema = new Schema(
  {
    name: {
      type: String,
    },
    code: {
      type: Number,
    },
  },
  { timestamps: true },
);

type Bank = InferSchemaType<typeof bankSchema>;

const BankModel = model("Bank", bankSchema);

export { Bank, BankModel };
