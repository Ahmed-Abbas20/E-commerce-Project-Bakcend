const User = require("./User");

const StaffSchema = new mongoose.Schema({
	managerId:{ type:number , ref:StaffSchema },
	SSN:{type:String,required:true},
    role: { type: String, enum: ["super_admin", "clerk", "cashier" , "manager"], required: true },
}
);

module.exports = User.discriminator("Staff", StaffSchema);
