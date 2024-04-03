import { InferSchemaType, model, Schema, Types } from "mongoose";

const accountSchema = new Schema(
  {
    bank: {
      type: Types.ObjectId,
    },
    accountNumber: {
      type: String,
    },
    accountVerificationDigit: {
      type: String,
    },
    agencyNumber: {
      type: String,
    },
    pixKey: {
      type: String,
    },
  },
  { timestamps: true },
);

type Account = InferSchemaType<typeof accountSchema>;

const AccountModel = model("Account", accountSchema);

export { Account, AccountModel };
