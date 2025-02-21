const mongoose = require("mongoose");
const User = require("./base.model");

const StaffSchema = new mongoose.Schema({

  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch", 
    required: true, 

  },
  SSN: { type: String, required: true },
  role: {
    type: String,
    enum: ["super_admin", "cashier", "manager"], 
    required: true,
  },
});

module.exports = User.discriminator("staff", StaffSchema);
