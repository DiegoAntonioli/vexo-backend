import { InferSchemaType, model, Schema, Types } from "mongoose";
import { ILoanAgreement } from "./loanAgreement";

export enum InstallmentStatus {
  PENDING = "pending",
  OVERDUE = "overdue",
  PAID = "paid",
}

const installmentSchema = new Schema(
  {
    amount: {
      type: Number,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(InstallmentStatus),
    },
    paymentSlip: {
      type: Types.ObjectId,
      ref: "PaymentSlip",
    },
    paymentSlips: [
      {
        type: Types.ObjectId,
        ref: "PaymentSlip",
      },
    ],
    loanAgreement: {
      type: Types.ObjectId,
      ref: "LoanAgreement",
    },
    chargeCelcashId: {
      type: String,
    },
    paymentLink: {
      type: String,
    },
  },
  { timestamps: true },
);

type Installment = InferSchemaType<typeof installmentSchema>;

export interface IPopulatedInstallment {
  amount: number;
  dueDate: Date;
  status: string;
  paymentSlip: Types.ObjectId;
  paymentSlips: Types.ObjectId[];
  loanAgreement: ILoanAgreement;
  chargeCelcashId: string;
  paymentLink: string;
}

const InstallmentModel = model("Installment", installmentSchema);

export { Installment, InstallmentModel };
