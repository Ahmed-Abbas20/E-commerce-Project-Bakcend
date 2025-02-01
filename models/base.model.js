const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserBaseSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone1: { type: String, required: true, unique: true },
    userType: {
      type: String,
      enum: ["Staff", "Customer", "Seller"],
      default: "Customer",
      required: true,
    },
    salt: { type: String, required: true },
  },
  { discriminatorKey: "userType", timestamps: true }
);
UserBaseSchema.methods.comparePassword = async function (enteredPassword) {
  const hashedPassword = await bcrypt.hash(enteredPassword, this.salt);
  return hashedPassword === this.password;
};

module.exports = mongoose.model("User", UserBaseSchema);
