const {updateProduct,deleteProduct,createProduct}=require('../repos/SellerReq.repo');

exports.CreateProduct=async (productData)=>{
    const newproduct=await createProduct(productData);
     return newproduct;
}

exports.updateProduct = async (productId, updateData) => {
const updatedProduct=await updateProduct(productId, updateData, { new: true });
return updatedProduct;
};

exports.deleteProduct = async (productId) => {
  const deletedproduct=await deleteProduct(productId);
  };

