const mongoose = require("mongoose");
const User = require("./base.model"); 


const StaffSchema = new mongoose.Schema({
  managerId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
  },
  SSN: { type: String, required:true },
  role: {
    type: String,
    enum: ["super_admin", "clerk", "cashier", "manager"], 
    required: true,
  },
});

module.exports = User.discriminator("staff", StaffSchema); 


