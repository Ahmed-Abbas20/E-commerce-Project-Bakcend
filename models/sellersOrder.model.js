const mongoose = require("mongoose");

const SellersOrderSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        productName: { type: String, required: true },
        category: { type: String, required: true },
        productImages: [
          {
            fileId: { type: String, required: true },
            filePath: { type: String, required: true },
          },
        ],
        price: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        requiredQty: { type: Number, required: true },
      }
    ],
    totalPrice: { type: Number, required: true },
    totalQty: { type: Number, required: true },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

const SellersOrder = mongoose.model("SellersOrder", SellersOrderSchema);
module.exports = SellersOrder;
