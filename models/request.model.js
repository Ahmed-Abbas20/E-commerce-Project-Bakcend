const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema(
  {
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        requestedQty: { type: Number, required: true, min: 1 },
        approvedQty: { type: Number, default: 0 }, 
      }
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "partially_approved", "rejected"],
      default: "pending",
    },
    adminResponse: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", RequestSchema);
