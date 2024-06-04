import { InferSchemaType, model, Schema, Types } from "mongoose";

const accountSchema = new Schema(
  {
    bank: {
      type: Number,
    },
    accountNumber: {
      type: String,
    },
    agencyNumber: {
      type: String,
    },
    pixKey: {
      type: String,
      required: true,
    },
    pixType: {
      type: String,
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

type Account = InferSchemaType<typeof accountSchema>;

export interface IAccount {
  bank: number;
  accountNumber: string;
  agencyNumber: string;
  pixKey: string;
  pixType: string;
  user: Types.ObjectId;
}

const AccountModel = model("Account", accountSchema);

export { Account, AccountModel };
