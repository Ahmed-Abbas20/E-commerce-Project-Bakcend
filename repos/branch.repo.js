
const Branch = require("../models/branch.model");
const { AppError } = require("../utils/errorHandler");
const mongoose=require('mongoose')
const Product = require("../models/product.model");

exports.createBranch = async (branchData) => {
  return await Branch.create(branchData);
};

exports.getAllBranches = async () => {
  return await Branch.find().populate("stock.productId");
};

exports.getBranchById = async (branchId) => {
  const branch = await Branch.findById(branchId).populate("stock.productId");
  if (!branch) throw new AppError("Branch not found", 404);
  return branch;
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

exports.findBranchById = async (branchId, session = null) => {
  return Branch.findById(branchId).session(session);
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

exports.removeProductFromBranch = async (branchId, productId, session = null) => {
  return Branch.findByIdAndUpdate(
    branchId,
    { $pull: { stock: { productId: new mongoose.Types.ObjectId(productId) } } }, // Ensure ObjectId consistency
    { new: true, session }
  );
};







