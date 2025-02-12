const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const DEFAULT_IMAGE = {
  fileId: "default-file-id",
  filePath: "https://yourcdn.com/default-profile.jpg",
};

// ✅ Address Schema with Zip Code & Gov
const AddressSchema = new mongoose.Schema({
  city: { type: String, required: true },
  street: { type: String, required: true },
  gov: { type: String, required: true }, // Governorate / State
  zipCode: { type: String, required: true }, // Postal / Zip Code
  
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

    // ✅ Address List (Optional)
    addresses: { type: [AddressSchema], default: [] },
  },
  { discriminatorKey: "userType", timestamps: true }
);

UserBaseSchema.methods.comparePassword = async function (enteredPassword) {
  const hashedPassword = await bcrypt.hash(enteredPassword, this.salt);
  return hashedPassword === this.password;
};

// ✅ Export the User model
const User = mongoose.model("User", UserBaseSchema);
module.exports = User;
