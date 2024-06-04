import { InferSchemaType, model, Schema, Types } from "mongoose";

export enum PaymentSlipStatus {
  PENDING = "pending",
  OVERDUE = "overdue",
  NOT_COMPENSATED = "notCompensated",
  PAID = "paid",
  UNDER_PAID = "underPaid",
  OVER_PAID = "overPaid",
  DUPLICITY = "duplicity",
  CANCELED = "canceled",
  EXTERNAL_PAYMENT = "externalPayment",
}

// active Ativa
// canceled Cancelada
// closed Encerrada
// waitingPayment Aguardando pagamento
// inactive Inativa

const paymentSlipSchema = new Schema(
  {
    celcashId: {
      type: String,
    },
    value: {
      type: Number,
    },
    dueDate: {
      type: Date,
    },
    fine: {
      type: Number,
    },
    interest: {
      type: Number,
    },
    instructions: {
      type: String,
    },
    deadlineDays: {
      type: Number,
    },
    documentNumber: {
      type: Number,
    },
    id: {
      type: String,
    },
    code: {
      type: String,
    },
    installments: [
      {
        type: Types.ObjectId,
        ref: "Installment",
      },
    ],
    paymentLink: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(PaymentSlipStatus),
    },
    statusDescription: {
      type: String,
    },
    tid: {
      type: String,
    },
    authorizationCode: {
      type: String,
    },
    reasonDenied: {
      type: String,
    },
    transactions: [
      {
        type: Types.ObjectId,
        ref: "Installment",
      },
    ],
  },
  { timestamps: true },
);

type PaymentSlip = InferSchemaType<typeof paymentSlipSchema>;

const PaymentSlipModel = model("PaymentSlip", paymentSlipSchema);

export { PaymentSlip, PaymentSlipModel };
