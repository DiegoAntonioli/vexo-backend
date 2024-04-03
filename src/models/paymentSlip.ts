import { InferSchemaType, model, Schema, Types } from "mongoose";

enum PaymentSlipStatus {
  PENDING = "pending",
  OVERDUE = "overdue",
  NOT_COMPENSATED = "notCompensated",
  PAID = "paid",
  UNDER_PAID = "underPaid",
  OVER_PAID = "overPaid",
  DUPLICITY = "duplicity",
  CANCELED = "canceled",
  EXTRENAL_PAYMENT = "externalPayment",
}

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
  },
  { timestamps: true },
);

type PaymentSlip = InferSchemaType<typeof paymentSlipSchema>;

const PaymentSlipModel = model("PaymentSlip", paymentSlipSchema);

export { PaymentSlip, PaymentSlipModel };
