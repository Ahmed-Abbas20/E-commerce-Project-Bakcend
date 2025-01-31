const InventorySchema = new mongoose.Schema({
    productId: { type: String, required: true},
      providerID: {type: String , required: true},
    providerName: { type: String, required: true },
    productName: { type: String, required: true },
    currentStock: { type: Number, required: true },
    isProvidedBySupplier:{type:Boolean,required:true},
  });
  
  module.exports = mongoose.model("Inventory", InventorySchema);
  
  //sinventory
  const mongoose = require("mongoose")
  const CInventory= require("./CInventory");
  
  const SInventorySchema = new mongoose.Schema({
  });
    
  module.exports =CInventory.discriminator("SInventory", SInventorySchema);
    
    
  
  