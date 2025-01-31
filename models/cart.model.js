const CartSchema = new mongoose.Schema({
    cartId: {  type: String, required: true },
    products: [
      {
        productId: { type: String, required: true , ref:Product},
        requiredQty: { type: Number, required: true },
      },
    ],customerId: { type: String, required: true },
  });
  
  module.exports = mongoose.model("Cart", CartSchema);
  