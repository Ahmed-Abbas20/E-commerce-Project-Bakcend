const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cashierId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Only required if offline
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  paymentMethod: { type: String, enum: ["Cash", "Card"], required: true },
  orderType: { type: String, enum: ["online", "offline"], required: true },

  // Main Order Status (Will control seller orders)
  status: {
    type: String,
    enum: ["Pending", "OnTheWay", "Delivered", "Cancelled"],
    default: "Pending",
    required: function () { return this.orderType === "online"; },
  },

  gov: { type: String, required: true },
  address: { type: String, required: true },
  phone1: { type: String, required: true },
  phone2: { type: String },
  customerNotes: { type: String },

  // Main Order Products
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      productName: { type: String },
      productCode: { type: Number },
      productImages: [
        {
          fileId: { type: String, required: true },
          filePath: { type: String, required: true }
        }
      ],
      price: { type: Number, required: true },
      totalPrice: { type: Number },
      requiredQty: { type: Number, required: true }
    }
  ],

  // Seller-Specific Orders (Sub-orders inside main order)
  sellersOrders: [
    {
      sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Seller Reference
      products: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
          quantity: { type: Number, required: true },
          price: { type: Number, required: true }
        }
      ],
      totalPrice: { type: Number, required: true },
      totalQty: { type: Number, required: true },

      // Seller Order Status (References the main order status)
      status: { 
        type: String,
        get: function () {
          return this.parent().status; // Inherit main order status
        }
      }
    }
  ],

  totalPrice: { type: Number, required: true },
  totalQty: { type: Number, required: true },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
