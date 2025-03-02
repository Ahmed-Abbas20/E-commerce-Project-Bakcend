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
        "seller",
        "request",
      ],
    },
    action: {
      type: [String],
      required: true,
      enum: [
        "create", "getAll", "getById", "updateById", "deleteById","getBranchById","approveFull","approvePartial","reject",
        "filterProductsByBranchId", "searchProductsByBranchId","getProductsByBranchId","getMyBranchProducts", "addProductToBranchId", "removeProductFromBranchId",
        "getMyBranchOrders","getBranchOrders","getSellersAnalysis","getAllByMyBranch",
        "getAllMainStock","searchAllMainStock","filterAllMainStock",
        "getAddressByCustomerId", "addAddressByCustomerId", "addProductOffline", "createOfflineOrder","adminAddProduct",
        "getCustomerOrdersByCustomerId", "getSellerOrdersBySellerId", "updateOrderById", "cancelOrderById",
        "getSellerAddressesBySellerId", "addAddressToSellerById"
      ],
    },

    description: {
      type: String,
      required: true,
    },

    condition: {
      type: Object, 
      default: {},  
    },
  },
  { timestamps: true }
);

const Permission = mongoose.model("Permission", PermissionSchema);

module.exports = Permission;
