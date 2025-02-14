const Branch = require("../models/branch.model");
const { AppError } = require("../utils/errorHandler");
const mongoose=require('mongoose')

exports.createBranch = async (branchData) => {
  return await Branch.create(branchData);
};

exports.getAllBranches = async () => {
  return await Branch.find().populate("managerId cashierId stock.productId");
};

exports.getBranchById = async (branchId) => {
  const branch = await Branch.findById(branchId).populate("managerId cashierId stock.productId");
  if (!branch) throw new AppError("Branch not found", 404);
  return branch;
};

exports.updateBranch = async (branchId, updatedData) => {
  const branch = await Branch.findByIdAndUpdate(branchId, updatedData, { new: true }).populate("managerId cashierId stock.productId");
  if (!branch) throw new AppError("Branch not found", 404);
  return branch;
};

exports.deleteBranch = async (branchId) => {
  const branch = await Branch.findByIdAndDelete(branchId);
  if (!branch) throw new AppError("Branch not found", 404);
  return branch;
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


