const mongoose = require("mongoose");
const { AddressSchema } = require("./User"); // Import AddressSchema from User
const User = require("./User"); // Import User model to fetch user details

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

  address: {
    type: AddressSchema,
    required: function () { return this.orderType === "online"; }, 
  },
  phone: { type: String, required: true }, 
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

  
  sellersOrders: [
    {
      sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      products: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
          quantity: { type: Number, required: true },
          price: { type: Number, required: true }
        }
      ],
      totalPrice: { type: Number, required: true },
      totalQty: { type: Number, required: true },

      
      status: { 
        type: String,
        get: function () {
          return this.parent().status; 
        }
      }
    }
  ],

  totalPrice: { type: Number, required: true },
  totalQty: { type: Number, required: true },
});


OrderSchema.pre("validate", async function (next) {
  if (this.orderType === "online" && (!this.address || Object.keys(this.address).length === 0)) {
    const user = await User.findById(this.customerId);
    if (user && user.addresses.length > 0) {
      this.address = user.addresses[0]; 
    } else {
      return next(new Error("No default address found for user"));
    }
  }
  next();
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
