import { InferSchemaType, model, Schema, Types } from "mongoose";

enum InstallmentStatus {
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
  },
  { timestamps: true },
);

type Installment = InferSchemaType<typeof installmentSchema>;

const InstallmentModel = model("Installment", installmentSchema);

export { Installment, InstallmentModel };
