const mongoose = require("mongoose");
const { AddressSchema } = require("./base.model"); 

const OrderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cashierId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    paymentMethod: { type: String, enum: ["Cash", "Card"], required: true },
    orderType: { type: String, enum: ["online", "offline"], required: true },
    status: { 
      type: String, 
      enum: ["pending", "onTheWay", "delivered", "cancelled"], 
      required: function () {
        return this.orderType === "online";
      },
    }, 
    
    customerName: {
      type: String,
      required: function () {
        return this.orderType === "offline";
      },
    },
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

    sellersOrders: [
      { order: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, ref: "SellersOrder" } }
    ],
  },
  { timestamps: true }
);


const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
