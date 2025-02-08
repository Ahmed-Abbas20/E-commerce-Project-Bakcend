const CartSchema = new mongoose.Schema({
    
    products: [
      {
        productId: { type: String, required: true , ref:Product},
        requiredQty: { type: Number, required: true },
      },
    ],customerId: { type: String, required: true },
  });
  
  module.exports = mongoose.model("Cart", CartSchema);
  