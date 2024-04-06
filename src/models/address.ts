import { InferSchemaType, model, Schema, Types } from "mongoose";

const addressSchema = new Schema(
  {
    postalCode: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
    addressLine2: {
      type: String,
    },
    neighborhood: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
    },
    company: {
      type: Types.ObjectId,
      ref: "Company",
    },
  },
  { timestamps: true },
);

type Address = InferSchemaType<typeof addressSchema>;

const AddressModel = model("Address", addressSchema);

export { Address, AddressModel };
