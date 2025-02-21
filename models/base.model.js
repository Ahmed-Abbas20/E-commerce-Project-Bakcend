const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const DEFAULT_IMAGE = {
  fileId: "67b63936432c47641646f3ae",
  filePath: "/users/user_default.png",
};


const AddressSchema = new mongoose.Schema({
  city: { type: String, required: true },
  street: { type: String, required: true },
  gov: { type: String, required: true }, 
  zipCode: { type: String, required: true }, 
  
});

const UserBaseSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone1: { type: String, required: true, unique: true },
    userType: {
      type: String,
      enum: ["staff", "customer", "seller"],
      default: "customer",
      required: true,
    },
    image: {
      fileId: { type: String, default: DEFAULT_IMAGE.fileId },
      filePath: { type: String, default: DEFAULT_IMAGE.filePath },
    },
    salt: { type: String, required: true },
    isActive: { type: Boolean, default: true },

   
    addresses: { type: [AddressSchema], default: [] },
  },
  { discriminatorKey: "userType", timestamps: true }
);

UserBaseSchema.methods.comparePassword = async function (enteredPassword) {
  const hashedPassword = await bcrypt.hash(enteredPassword, this.salt);
  return hashedPassword === this.password;
};


const User = mongoose.model("User", UserBaseSchema);
module.exports = User; // Export User as default
module.exports.AddressSchema = AddressSchema; 
