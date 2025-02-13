const mongoose = require("mongoose");
const Product = require("./MainInventory.model"); // Import Product model
const { AppError } = require("../utils/errorHandler"); // Import AppError

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
});

// Pre-save hook to validate quantities
CartSchema.pre("save", async function (next) {
  for (const item of this.products) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new AppError(`Product with ID ${item.productId} not found`, 404);
    }
    if (item.quantity > product.quantity) {
      throw new AppError(
        `Cannot add more than ${product.quantity} units of product ${product.name}.`,
        400
      );
    }
  }
  next();
});

module.exports = mongoose.model("Cart", CartSchema);