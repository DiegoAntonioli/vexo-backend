import { InferSchemaType, model, Schema, Types } from "mongoose";

enum SignatureStatus {
  PENDING = "pending",
  SIGNED = "signed",
}

const signatureSchema = new Schema(
  {
    status: {
      type: String,
      enum: Object.values(SignatureStatus),
    },
    date: {
      type: Date,
    },
    loanAgreement: {
      type: Types.ObjectId,
      ref: "LoanAgreement",
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
    },
    signatureUri: {
      type: String,
    },
  },
  { timestamps: true },
);

type Signature = InferSchemaType<typeof signatureSchema>;

const SignatureModel = model("Signature", signatureSchema);

export { Signature, SignatureModel };
