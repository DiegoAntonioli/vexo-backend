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
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

type Account = InferSchemaType<typeof accountSchema>;

const AccountModel = model("Account", accountSchema);

export { Account, AccountModel };
