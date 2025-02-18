const mongoose = require("mongoose");
const { AddressSchema } = require("./base.model"); // Import AddressSchema from User

const OrderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ✅ Online orders only
    cashierId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ✅ Offline orders only
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    paymentMethod: { type: String, enum: ["Cash", "Card"], required: true },
    orderType: { type: String, enum: ["online", "offline"], required: true },

    // ✅ Only for offline orders (NEW)
    customerName: {
      type: String,
      required: function () {
        return this.orderType === "offline";
      },
    },

    // ✅ Only for online orders
    address: {
      type: AddressSchema,
      required: function () {
        return this.orderType === "online";
      },
    },

    phone: { type: String, required: true },

    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        productName: { type: String },
        productCode: { type: Number },
        productImages: [
          {
            fileId: { type: String, required: true },
            filePath: { type: String, required: true },
          },
        ],
        price: { type: Number, required: true },
        totalPrice: { type: Number },
        requiredQty: { type: Number, required: true },
      },
    ],

    totalPrice: { type: Number, required: true },
    totalQty: { type: Number, required: true },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
