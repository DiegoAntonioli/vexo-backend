import { InferSchemaType, model, Schema, Types } from "mongoose";

const loanAgreementSchema = new Schema(
  {
    galaxPayId: {
      type: String,
    },
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
    employmentRelation: {
      type: Types.ObjectId,
      ref: "EmploymentRelation",
    },
    roles: [
      {
        type: Types.ObjectId,
        ref: "Role",
      },
    ],
    cellcoinId: {
      type: String,
    },
  },
  { timestamps: true },
);

type LoanAgreement = InferSchemaType<typeof loanAgreementSchema>;

export interface ILoanAgreement {
  amount: number;
  numberOfInstallments: number;
  interestRate: number;
  installments: Types.ObjectId[];
  creditTransaction: Types.ObjectId;
  borrowerSignature: Types.ObjectId;
  employmentRelations: Types.ObjectId[];
  employmentRelation: Types.ObjectId;
  roles: Types.ObjectId[];
  cellcoinId: {
    type: String;
  };
}

const LoanAgreementModel = model("LoanAgreement", loanAgreementSchema);

export { LoanAgreement, LoanAgreementModel };
