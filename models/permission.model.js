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
        "create", "getAll", "getById", "updateById", "deleteById","getBranchById",
        "filterProductsByBranchId", "searchProductsByBranchId","getProductsByBrnachId","getMyBranchProducts", "addProductToBranchId", "removeProductFromBranchId",
        "getMyBranchOrders","getBranchOrders","getSellersAnalysis",
        "getAllMainStock","searchAllMainStock","filterAllMainStock",
        "getAddressByCustomerId", "addAddressByCustomerId", "addProduct", "createOfflineOrder","adminAddProduct",
        "getCustomerOrdersByCustomerId", "getSellerOrdersBySellerId", "updateOrderById", "cancelOrderById",
          "editById",
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
