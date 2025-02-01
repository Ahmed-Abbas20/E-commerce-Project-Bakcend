const User = require("./base.model");
const mongoose = require("mongoose");

const StaffSchema = new mongoose.Schema({
	managerId:{ type:String ,},
	SSN:{type:String,},
    role: { type: String, enum: ["super_admin", "clerk", "cashier" , "manager"], required: true },
}
);

module.exports = User.discriminator("staff", StaffSchema);
