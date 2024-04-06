import { hashSync } from "bcrypt";
import { UserType } from "models/types";
import { UserModel } from "models/user";

export const createAdmin = async () => {
  console.log("createAdmin");
  const admin = await UserModel.findOne({
    cpf: "00000000000",
  });
  if (!admin) {
    const hashedPassword = hashSync("vexo@amdmin", 10);
    const newAdmin = new UserModel({
      cpf: "00000000000",
      userType: UserType.ADMIN,
      hashedPassword,
    });
    console.log({ newAdmin });
    await newAdmin.save();
  }
};
