
const Branch = require("../models/branch.model");
const { AppError } = require("../utils/errorHandler");
const mongoose=require('mongoose')
const Product = require("../models/product.model");
const { BASE_IMAGE_URL } = require('../config/app.config');
const { updateMainStock  } = require('../repos/product.repo');

exports.createBranch = async (branchData) => {
  return await Branch.create(branchData);
};

exports.getAllBranches = async () => {
  return await Branch.find().populate("stock.productId");
};
exports.findBranchById = async (branchId, session = null) => {
  return Branch.findById(branchId).session(session);
};

exports.getBranchByManagerId = async (managerId) => {
  try {
    const branch = await Branch.findOne({ managerId: managerId })
      .populate("stock.productId")
      .populate("manager", "firstName lastName email"); // Optional: populate manager details

    if (!branch) {
      throw new AppError("Branch not found for this manager", 404);
    }
    
    return branch;
  } catch (error) {
    throw new AppError(`Error finding branch by manager ID: ${error.message}`, 500);
  }
};

exports.updateBranch = async (branchId, updatedData) => {
  const branch = await Branch.findByIdAndUpdate(branchId, updatedData, { new: true }).populate("stock.productId");
  if (!branch) throw new AppError("Branch not found", 404);
  return branch;
};

exports.deleteBranch = async (branchId) => {

  const branch = await Branch.findById(branchId);
  if (!branch) throw new AppError("Branch not found", 404);

  if (branch.stock && branch.stock.length > 0) {
    for (const stockItem of branch.stock) {
      const product = await Product.findById(stockItem.productId);
      if (product) {
        product.mainStock += stockItem.quantity;
        await product.save();
      }
    }
  }

  // Delete the branch after returning products to main stock
  await Branch.findByIdAndDelete(branchId);

  return { message: "Branch deleted and products returned to main stock successfully." };
};



exports.updateBranchStockAdd = async (branchId, productId, quantity, session = null) => {
  return Branch.findByIdAndUpdate(
    branchId,
    { $inc: { 'stock.$[elem].quantity': quantity } },
    {
      arrayFilters: [{ 'elem.productId': productId }],
      new: true,
      session
    }
  );
};

exports.addNewProductToBranch = async (branchId, productId, quantity, session = null) => {
  return Branch.findByIdAndUpdate(
    branchId,
    { 
      $push: { 
        stock: { 
          productId:new mongoose.Types.ObjectId(productId),
          quantity 
        } 
      } 
    },
    { new: true, session }
  );
};


exports.updateBranchStockAdd = async (branchId, productId, quantity, session = null) => {
  return Branch.findOneAndUpdate(
    {
      _id: branchId,
      'stock.productId': new mongoose.Types.ObjectId(productId)
    },
    { $inc: { 'stock.$.quantity': quantity } },
    { new: true, session }
  );
};

exports.updateBranchStockRemove = async (branchId, productId, quantity, session = null) => {
  return Branch.findOneAndUpdate(
    {
      _id: branchId,
      'stock.productId': new mongoose.Types.ObjectId(productId),
      'stock.quantity': { $gte: quantity } // Prevent negative stock
    },
    { $inc: { 'stock.$.quantity': -quantity } },
    { new: true, session }
  );
};

 const removeProductFromBranchHelper = async (branchId, productId, session = null) => {
  return Branch.findByIdAndUpdate(
    branchId,
    { $pull: { stock: { productId: new mongoose.Types.ObjectId(productId) } } }, // Ensure ObjectId consistency
    { new: true, session }
  );
}; 


exports.findBranchProduct = async (branchId, productId) => {
  return await Branch.findOne({
    _id: branchId,
    "stock.productId": productId, // Check if product exists in branch
  });
};








exports.filterBranchProducts = async (branchId, filters) => {
  try {
    
      const branch = await Branch.findById(branchId).lean();
      if (!branch) throw new AppError("Branch not found", 404);
      if (!branch.stock?.length) return { products: [], total: 0 };

  
      const quantityMap = new Map();
      branch.stock.forEach(item => {
          if (item.quantity > 0) { // ❗ Ensure the quantity is greater than 0
              quantityMap.set(item.productId.toString(), item.quantity);
          }
      });

      // Extract the list of productIds available in the branch (quantity > 0)
      const productIds = Array.from(quantityMap.keys());

      //  Build the query (filtering only available products in the branch)
      const query = {
          _id: { $in: productIds },
          ...(filters.category && { categoryName: filters.category }),
          soldPrice: {
              ...(filters.min && { $gte: Number(filters.min) }),
              ...(filters.max && { $lte: Number(filters.max) })
          }
      };

      //  Fetch products from `MainInventory`, but only those available in the branch
      let products = await Product.find(query)
          .sort({ createdAt: -1 })
          .lean();

      
      products = products.map(product => ({
          ...product,
          branchQuantity: quantityMap.get(product._id.toString()) || 0
      }));

     
      products.sort((a, b) => {
          if (a.branchQuantity !== b.branchQuantity) {
              return b.branchQuantity - a.branchQuantity; // Higher quantity first
          }
          return new Date(b.createdAt) - new Date(a.createdAt); // Newer products first
      });

     
      const limit = 20;
      const startIndex = (filters.page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = products.slice(startIndex, endIndex);

     
      const formattedProducts = paginatedProducts.map(product => ({
          ...product,
          images: product.images.map(img => ({
              fileId: img.fileId,
              url: `${BASE_IMAGE_URL}${img.filePath}`
          }))
      }));

      return {
          products: formattedProducts,
          total: products.length,
          page: filters.page,
          totalPages: Math.ceil(products.length / limit)
      };

  } catch (error) {
      throw new AppError(
          error.message || "Failed to fetch branch products",
          error.statusCode || 500
      );
  }
};



  exports.searchBranchProducts = async (branchId, searchTerm) => {
    try {
      // Validate branch exists
      const branch = await Branch.findById(branchId).lean();
      if (!branch) throw new AppError("Branch not found", 404);
      
      // Create product ID -> quantity map
      const quantityMap = new Map(
        branch.stock.map(item => [
          item.productId.toString(), 
          item.quantity
        ])
      );
  
      // Get product IDs from branch stock
      const productIds = branch.stock.map(item => item.productId);
  
      // Build search query
      const query = {
        _id: { $in: productIds },
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ]
      };
  
      // Execute search
      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .lean();
  
      // Transform results with branch quantities
      return products.map(product => ({
        ...product,
        branchQuantity: quantityMap.get(product._id.toString()) || 0,
        images: product.images.map(img => ({
          fileId: img.fileId,
          url: `${BASE_IMAGE_URL}${img.filePath}`
        }))
      }));
  
    } catch (error) {
      throw new AppError(
        error.message || "Search failed", 
        error.statusCode || 500
      );
    }
  };



  
  // Function to add a product to a branch
  exports.addProductToBranch = async (branchId, productId, quantity) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {

      const product = await Product.findById(productId).session(session);
      if (!product) throw new AppError('Product not found', 404);
      if (product.mainStock < quantity) throw new AppError('Insufficient main stock', 400);
  
      const branch = await Branch.findById(branchId).session(session);
      if (!branch) throw new AppError('Branch not found', 404);
  
      const existingProduct = branch.stock.find(item => item.productId.toString() === productId);
      if (existingProduct) {
        throw new AppError("Product already exists in the branch", 400);
      }
  
      branch.stock.push({
        productId: productId,
        quantity: quantity
      });
  
      await branch.save({ session });
  
      product.mainStock -= quantity;
      await product.save({ session });
  
      await session.commitTransaction();
      return {
        success: true,
        action: 'added',
        newQuantity: quantity
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  };
  
  
  exports.removeProductFromBranch = async (branchId, productId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      // 1. Validate branch stock
      const branch = await findBranchById(branchId, session);
      const stockItem = branch.stock.find(item => item.productId.toString() === productId);
  
      if (!stockItem) {
        throw new AppError("Product not found in branch stock", 400);
      }
  
      const quantity = stockItem.quantity; // Get full quantity
  
      // 2. Remove the product from branch stock
      await removeProductFromBranchHelper(branchId, productId, session);
  
      // 3. Update main inventory
      await updateMainStock(productId, quantity, session);
  
      await session.commitTransaction();
      return { success: true };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  };
  
  
  exports.getProductsInBranch = async (branchId) => {
    const branch = await Branch.findById(branchId)
      .populate("stock.productId")
      .lean();
  
    if (!branch) throw new AppError("Branch not found", 404);
  
    return branch.stock.map(item => {
      const product = item.productId;
  
      if (product && product.images) {
        product.images = product.images.map(img => ({
          fileId: img.fileId,
          filePath: `${process.env.IMAGEKIT_ENDPOINT_URL}${img.filePath}`
        }));
      }
  
      return {
        product,
        quantity: item.quantity
      };
    });
  };
  




