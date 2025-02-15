const mongoose = require("mongoose");
const Product = require("./product.model");
const { AppError } = require("../utils/errorHandler");

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true }, // Add branchId
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
});

// Pre-save hook to validate quantities
CartSchema.pre("save", async function (next) {
  const branch = await mongoose.model("Branch").findById(this.branchId);
  if (!branch) {
    throw new AppError("Branch not found", 404);
  }

  for (const item of this.products) {
    const productInBranch = branch.stock.find(
      (stockItem) => stockItem.productId.toString() === item.productId.toString()
    );

    if (!productInBranch) {
      throw new AppError(`Product with ID ${item.productId} not found in branch stock`, 404);
    }
    if (item.quantity > productInBranch.quantity) {
      throw new AppError(
        `Cannot add more than ${productInBranch.quantity} units of product ${item.productId}.`,
        400
      );
    }
  }
  next();
});

module.exports = mongoose.model("Cart", CartSchema);