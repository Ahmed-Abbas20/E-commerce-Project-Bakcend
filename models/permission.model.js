const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema({
  effect: {
    type: String,
    required: true,
    enum: ["allow", "deny"], 
  },
  resource: {
    type: String,
    required: true,
    enum: [
      "managers",
      "cashiers",
      "customers",
      "clerks",
      "products",
      "sellers",
      "suppliers",
      "seller_inventory",
      "supplier_inventory",
      "cus_orders",
      "supplier_orders",
      "category",

      "clerk",
      "cashier",
      "manager",

  

    ], 
  },
  action: {
    type: [String],  
    required: true,
    enum: ["create", "read", "update", "delete"], 
  },

  description: {
    type: String,
    required: true, // Description of the permission
  },
  condition: {
    role: {
      IN: {
        type: [String],
        default: [],
      },
     
    }
  },
}, { timestamps: true });

const Permission = mongoose.model("Permission", PermissionSchema);

module.exports = Permission;
