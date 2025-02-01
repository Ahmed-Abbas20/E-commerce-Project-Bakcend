const mongoose = require('mongoose');
const Product=require("./product.model")



const CategorySchema = new mongoose.Schema({

  _id: {
    type: mongoose.Schema.Types.ObjectId,
  },
name: {
type: String,
required: true,
unique: true,
trim: true
}
   

},)

//delete products related to category
CategorySchema.pre('remove', async function(next) {
  await mongoose.model('Product').deleteMany({ categoryId: this._id });
  next();
});

// Update product category names
CategorySchema.post('findOneAndUpdate', async function(doc) {
  if (doc && doc.isModified('name')) {
    await mongoose.model('Product').updateMany(
      { categoryId: doc._id },
      { $set: { categoryName: doc.name } }
    );
  }
});

module.exports = mongoose.model('Category', CategorySchema);