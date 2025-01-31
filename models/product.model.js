const ProductSchema = new mongoose.Schema({
    id: { type: String, required: true},
    name: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: [String] }],
    description: { type: String },
    quantity: { type: Number, required: true },
    categoryId: { type: String, required: true },
    sellerId: { type: String, default:null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  
  //review o product
  module.exports = mongoose.model("Product", ProductSchema);
  