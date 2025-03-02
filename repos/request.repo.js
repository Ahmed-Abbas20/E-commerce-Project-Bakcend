const Request = require("../models/request.model");
const Product = require("../models/product.model");
const { AppError } = require("../utils/errorHandler");
const Branch = require("../models/branch.model"); 
const mongoose = require("mongoose"); 
// Create a new request
exports.createRequest = async (managerId, branchId, products) => {
    try {
        const newRequest = new Request({
            managerId,
            branchId,
            products: products.map(product => ({
                productId: product.productId,
                requestedQty: product.requestedQty,
                approvedQty: 0,  
            })),
            status: "pending", 
        });

        return await newRequest.save();
    } catch (error) {
        throw new Error(`Failed to create request: ${error.message}`);
    }
};

  // Find an existing request with the same products from the same manager
  exports.findExistingRequest = async (managerId, products) => {
    return await Request.findOne({
      managerId,
      "products.productId": { $in: products.map((p) => p.productId) },
      status: "pending",
    });
  };

// Get all requests (Admin)
exports.getRequests = async (filter = {}) => {
  return await Request.find(filter)
    .populate("managerId", "firstName lastName")
    .populate("branchId", "name")
    .populate("products.productId", "name mainStock");
};

// Get a single request by ID
exports.getRequestById = async (id) => {
  return await Request.findById(id)
    .populate("managerId", "firstName lastName")
    .populate("branchId", "name")
    .populate("products.productId", "name mainStock");
};


// Approve Full Request (All products)
exports.approveFullRequest = async (id, adminResponse = "") => {
    const request = await Request.findById(id);
    if (!request) throw new AppError("Request not found", 404);

    const branch = await Branch.findById(request.branchId);
    if (!branch) throw new AppError("Branch not found", 404);

    for (let product of request.products) {
        const productInStock = await Product.findById(product.productId);

        if (product.requestedQty > productInStock.mainStock) {
            throw new AppError(
                `Not enough stock for product "${productInStock.name}". Available: ${productInStock.mainStock}`,
                400
            );
        }

        productInStock.mainStock -= product.requestedQty;
        await productInStock.save();

        product.approvedQty = product.requestedQty;

        branch.stock.forEach((stockItem) => {
            if (stockItem.productId.equals(product.productId)) {
                stockItem.quantity += product.requestedQty;
            }
        });
    }

    await branch.save();
    request.status = "approved";
    request.adminResponse = adminResponse;
    return await request.save();
};

// Approve Partial Request (Selected products only)
exports.approvePartialRequest = async (id, adminResponse = "", approvedProducts) => {
    const request = await Request.findById(id);
    if (!request) throw new AppError("Request not found", 404);

    const branch = await Branch.findById(request.branchId);
    if (!branch) throw new AppError("Branch not found", 404);

    let isPartiallyApproved = false;

    for (let product of request.products) {
        const approvedProduct = approvedProducts.find((p) => 
            new mongoose.Types.ObjectId(p.productId).equals(product.productId)
        );

        if (approvedProduct) {
            const productInStock = await Product.findById(product.productId);

            if (approvedProduct.approvedQty > productInStock.mainStock) {
                throw new AppError(
                    `Not enough stock for product "${productInStock.name}". Available: ${productInStock.mainStock}`,
                    400
                );
            }

            productInStock.mainStock -= approvedProduct.approvedQty;
            await productInStock.save();

            product.approvedQty = approvedProduct.approvedQty;
            isPartiallyApproved = true;

            branch.stock.forEach((stockItem) => {
                if (stockItem.productId.equals(product.productId)) {
                    stockItem.quantity += approvedProduct.approvedQty;
                }
            });
        }
    }

    await branch.save(); 

    request.status = isPartiallyApproved ? "partially_approved" : "rejected";
    request.adminResponse = adminResponse;
    return await request.save();
};

  

  

// Get requests by manager
exports.getRequestsByManager = async (managerId) => {
    return await Request.find({ managerId })
      .populate("branchId", "name")
      .populate("products.productId", "name");
  };
  
// Reject Request
  exports.rejectRequest = async (id, adminResponse) => {
    const request = await Request.findById(id);
    if (!request) throw new AppError("Request not found", 404);

    if (request.status !== "pending") {
        throw new AppError("Only pending requests can be rejected", 400);
    }

    request.status = "rejected";
    request.adminResponse = adminResponse;
    return await request.save();
};

