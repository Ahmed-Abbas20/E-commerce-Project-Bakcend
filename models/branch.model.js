const BranchSchema = new mongoose.Schema({
    name: { type: String,unique: true, required: true },
    location: { type: String, required: true },
    phone:{type:String,required: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
     cashierId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    stock: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 0 },
      },
    ],
  });
  const Branch = mongoose.model("Branch", BranchSchema);