const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema(
  {
    effect: {
      type: String,
      required: true,
      enum: ["allow", "deny"],
    },
    resource: {
      type: String,
      required: true,
      enum: [
        "branch",
        "cashier",
        "category",
        "customer",
        "manager",
        "order",
        "product",
        "seller"
      ],
    },
    action: {
      type: [String],
      required: true,
      enum: [
        "create", "getAll", "getById", "updateById", "deleteById",
        "filterProductsByBranchId", "searchProductsByBranchId", "addProductToBranchId", "removeProductFromBranchId", "getCurrentBranchProducts",
        "getAddressByCustomerId", "addAddressByCustomerId", "addProduct", "createOfflineOrder",
        "getCustomerOrdersByCustomerId", "getSellerOrdersBySellerId", "updateOrderById", "cancelOrderById",
        "getAllMainStock", "searchAllMainStock", "filterAllMainStock", "editById",
        "getSellerAddressesBySellerId", "addAddressToSellerById"
      ],
    },

    description: {
      type: String,
      required: true,
    },

    condition: {
      type: Object, // ✅ Flexible to store any object
      default: {},  // Simplified with no specific conditions required
    },
  },
  { timestamps: true }
);

const Permission = mongoose.model("Permission", PermissionSchema);

module.exports = Permission;
