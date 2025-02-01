const mongoose = require('mongoose');
const Product=require("./product.model")

const { v4: uuidv4 } = require('uuid');

const CategorySchema = new mongoose.Schema({

id: {
type: String,
default: uuidv4,
required: true
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
  await mongoose.model('Product').deleteMany({ categoryId: this.id });
  next();
});

// Update product category names
CategorySchema.post('findOneAndUpdate', async function(doc) {
  if (doc && doc.isModified('name')) {
    await mongoose.model('Product').updateMany(
      { categoryId: doc.id },
      { $set: { categoryName: doc.name } }
    );
  }
});

module.exports = mongoose.model('Category', CategorySchema);