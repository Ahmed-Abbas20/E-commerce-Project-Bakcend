const CategorySchema = new mongoose.Schema({
    id: { type: String, auto: true },
    name: { type: String, required: true },
  });
  
  module.exports = mongoose.model("Category", CategorySchema);
  
  