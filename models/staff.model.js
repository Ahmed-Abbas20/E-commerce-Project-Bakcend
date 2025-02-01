const mongoose = require("mongoose");
const User = require("./base.model"); 

const StaffSchema = new mongoose.Schema({
  managerId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff', 
    
  },
  SSN: { type: String },
  role: {
    type: String,
    enum: ["super_admin", "clerk", "cashier", "manager"], 
    required: true,
  },
});

module.exports = User.discriminator("staff", StaffSchema); 
