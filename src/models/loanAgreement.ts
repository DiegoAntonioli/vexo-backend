import { InferSchemaType, model, Schema, Types } from "mongoose";

const loanAgreementSchema = new Schema(
  {
    amount: {
      type: Number,
    },
    numberOfInstallments: {
      type: Number,
    },
    interestRate: {
      type: Number,
    },
    installments: [
      {
        type: Types.ObjectId,
        ref: "Installment",
      },
    ],
    creditTransaction: {
      type: Types.ObjectId,
      ref: "Transaction",
    },
    borrowerSignature: {
      type: Types.ObjectId,
      ref: "Signature",
    },
    employmentRelations: [
      {
        type: Types.ObjectId,
        ref: "EmploymentRelation",
      },
    ],
    roles: [
      {
        type: Types.ObjectId,
        ref: "Role",
      },
    ],
  },
  { timestamps: true },
);

type LoanAgreement = InferSchemaType<typeof loanAgreementSchema>;

const LoanAgreementModel = model("LoanAgreement", loanAgreementSchema);

export { LoanAgreement, LoanAgreementModel };
