const Branch = require('../models/branch.model');
const Product = require('../models/product.model');
const { AppError } = require('../utils/errorHandler');
const { BASE_IMAGE_URL } = require('../config/app.config');
const { 
  findBranchById,
  updateBranchStockAdd,
  addNewProductToBranch,
  updateBranchStockRemove,
  removeProductFromBranch
} = require('../repos/branch.repo');
const { 
  findProductById,
  updateMainStock ,
  
} = require('../repos/product.repo');
const mongoose=require('mongoose');


exports.filterBranchProducts = async (branchId, filters) => {
  try {
      // ✅ Check if the branch exists
      const branch = await Branch.findById(branchId).lean();
      if (!branch) throw new AppError("Branch not found", 404);
      if (!branch.stock?.length) return { products: [], total: 0 };

      // ✅ Create a `Map` to store productId -> quantity in the branch
      const quantityMap = new Map();
      branch.stock.forEach(item => {
          if (item.quantity > 0) { // ❗ Ensure the quantity is greater than 0
              quantityMap.set(item.productId.toString(), item.quantity);
          }
      });

      // ✅ Extract the list of productIds available in the branch (quantity > 0)
      const productIds = Array.from(quantityMap.keys());

      // ✅ Build the query (filtering only available products in the branch)
      const query = {
          _id: { $in: productIds },
          ...(filters.category && { categoryName: filters.category }),
          soldPrice: {
              ...(filters.min && { $gte: Number(filters.min) }),
              ...(filters.max && { $lte: Number(filters.max) })
          }
      };

      // ✅ Fetch products from `MainInventory`, but only those available in the branch
      let products = await Product.find(query)
          .sort({ createdAt: -1 })
          .lean();

      // ✅ Add the branch-specific quantity to each product
      products = products.map(product => ({
          ...product,
          branchQuantity: quantityMap.get(product._id.toString()) || 0
      }));

      // ✅ Sort products by quantity in the branch (descending)
      products.sort((a, b) => {
          if (a.branchQuantity !== b.branchQuantity) {
              return b.branchQuantity - a.branchQuantity; // Higher quantity first
          }
          return new Date(b.createdAt) - new Date(a.createdAt); // Newer products first
      });

      // ✅ Apply pagination
      const limit = 20;
      const startIndex = (filters.page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = products.slice(startIndex, endIndex);

      // ✅ Format images with full URL
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


  exports.addProductToBranch = async (branchId, productId, quantity) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const product = await findProductById(productId, session);
      if (!product) throw new AppError('Product not found', 404);
      if (product.mainStock < quantity) throw new AppError('Insufficient main stock', 400);
  
      // Try to update existing product in branch
      let branch = await updateBranchStockAdd(branchId, productId, quantity, session);
      
      // Add new product only if not exists
      if (!branch) {
        branch = await addNewProductToBranch(branchId, productId, quantity, session);
      }
  
      await updateMainStock(productId, -quantity, session);
      await session.commitTransaction();
      
      return { 
        success: true,
        action: branch ? 'updated' : 'added'
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  };
  
  exports.removeProductFromBranch = async (branchId, productId, quantity) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      // 1. Validate branch stock
      const branch = await findBranchById(branchId, session);
      const stockItem = branch.stock.find(item => 
        item.productId.toString() === productId
      );
      
      if (!stockItem || stockItem.quantity < quantity) {
        throw new AppError('Insufficient branch stock', 400);
      }
  
      // 2. Update branch stock
      if (stockItem.quantity === quantity) {
        await removeProductFromBranch(branchId, productId, session);
      } else {
        await updateBranchStockRemove(branchId, productId, quantity, session);
      }
  
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