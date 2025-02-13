const mongoose = require('mongoose');
const CategorySchema = new mongoose.Schema({
name: {
type: String,
required: true,
unique: true,
trim: true
}
},)

CategorySchema.pre("findOneAndDelete", async function (next) {
  const category = await this.model.findOne(this.getQuery()); // Get the category being deleted

  if (category) {
    await mongoose.model("MainInventory").deleteMany({ categoryId: category._id });
  }
  next();
});

// Update product category names
CategorySchema.post('findOneAndUpdate', async function(doc) {
  if (doc && doc.isModified('name')) {
    await mongoose.model('MainInventory').updateMany(
      { categoryId: doc._id },
      { $set: { categoryName: doc.name } }
    );
  }
});

module.exports = mongoose.model('Category', CategorySchema);