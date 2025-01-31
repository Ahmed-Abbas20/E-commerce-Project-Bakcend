const SupplierSchema = new mongoose.Schema({
    supplierId: { type: String, required: true },
    companyName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, unique: true, required: true },
  });
  
  module.exports = mongoose.model("Supplier", SupplierSchema);
  