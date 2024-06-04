import { InferSchemaType, model, Schema, Types } from "mongoose";

const transactionSchema = new Schema(
  {
    galaxPayId: {
      type: String,
    },
    chargeMyId: {
      type: String,
    },
    chargeGalaxPayId: {
      type: String,
    },
    value: {
      type: Number,
    },
    payday: {
      type: Date,
    },
    fee: {
      type: Number,
    },
    payedOutsideGalaxPay: {
      type: Boolean,
    },
    additionalInfo: {
      type: String,
    },
    installment: {
      type: Number,
    },
    paydayDate: {
      type: Date,
    },
    abecsReasonDenied: {
      code: {
        type: String,
      },
      message: {
        type: String,
      },
    },
    status: {
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
    boleto: {
      pdf: {
        type: String,
      },
      bankLine: {
        type: String,
      },
    },
    // Pix: {
    //   qrCode:
    //     "ABC123ABC123ABC123ABC123ABC123ABC123ABC123ABC123ABC123ABC123ABC123",
    //   reference: "E2024060320214344A8DB75E068D70D0329EA5E0ED00413",
    //   image: "https://app.celcoin.com.br/link-image-qrcode",
    //   page: "https://app.celcoin.com.br/link-page-qrcode",
    //   endToEnd: "E2024060320214344A8DB75E068D70D0329EA5E0ED00413",
    // },
  },
  { timestamps: true },
);

type Transaction = InferSchemaType<typeof transactionSchema>;

export interface ITransaction {
  galaxPayId: string;
  chargeMyId: string;
  chargeGalaxPayId: string;
  value: number;
  payday: Date;
  fee: number;
  payedOutsideGalaxPay: boolean;
  additionalInfo: string;
  installment: number;
  paydayDate: Date;
  abecsReasonDenied: {
    code: string;
    message: string;
  };
  status: string;
  tid: string;
  authorizationCode: string;
  reasonDenied: string;
  boleto: {
    pdf: string;
    bankLine: string;
  };
}
const TransactionModel = model("Transaction", transactionSchema);

export { Transaction, TransactionModel };
