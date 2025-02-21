const mongoose = require('mongoose');
const CategorySchema = new mongoose.Schema({
name: {
type: String,
required: true,
unique: true,
trim: true
}
},)


// delete products related to category
CategorySchema.pre('findOneAndUpdate', async function(next) {
  await mongoose.model('Product').deleteMany({ categoryId: this._id });

  next();
});

// Update product category names
CategorySchema.post('findOneAndUpdate', async function(doc) {
  if (doc && doc.isModified('name')) {
    await mongoose.model('product').updateMany(
      { categoryId: doc._id },
      { $set: { categoryName: doc.name } }
    );
  }
});

module.exports = mongoose.model('Category', CategorySchema);