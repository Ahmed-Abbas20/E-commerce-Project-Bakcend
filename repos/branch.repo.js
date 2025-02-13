const Branch = require("../models/branch.model");
const { AppError } = require("../utils/errorHandler");

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
