const mongoose = require("mongoose");

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
      required: true,
    },
    salt:{ type:String,
	    requried:true
    }
  },
  { discriminatorKey: "userType", timestamps: true } // 'userType' acts as a discriminator field
);

module.exports = mongoose.model("User", UserBaseSchema);
