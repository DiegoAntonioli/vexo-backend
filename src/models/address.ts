import { InferSchemaType, model, Schema, Types } from "mongoose";

const addressSchema = new Schema(
  {
    postalCode: {
      type: String,
    },
    street: {
      type: String,
    },
    number: {
      type: String,
    },
    addressLine2: {
      type: String,
    },
    neighborhood: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
    },
    companyId: {
      type: Types.ObjectId,
      ref: "Company",
    },
  },
  { timestamps: true },
);

type Address = InferSchemaType<typeof addressSchema>;

const AddressModel = model("Address", addressSchema);

export { Address, AddressModel };
