const SupplierOrderSchema = new mongoose.Schema({
    id: { type: String, required: true },
    products: [
      {
        productId: { type: String, required: true },
        askedQty: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        originalPrice: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Delivered", "Cancelled"],
      default: "Pending",
    },
    orderedDate: { type: Date, default: Date.now },
    arrivalDate: { type: Date },
    supplierId: { type: String, required: true },
    managerId: {  type: String, required: true },
    notes: { type: String },
  });
  
  module.exports = mongoose.model("SupplierOrder", SupplierOrderSchema);
  
  