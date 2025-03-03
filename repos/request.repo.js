const Request = require("../models/request.model");
const Product = require("../models/product.model");
const { AppError } = require("../utils/errorHandler");
const Branch = require("../models/branch.model"); 
const mongoose = require("mongoose"); 




// Get branch products and available main stock products
exports.getBranchAndMainStockProducts = async (branchId) => {
    const branch = await Branch.findById(branchId)
        .populate("stock.productId", "name soldPrice description images")
        .lean();

    if (!branch) throw new AppError("Branch not found", 404);

    const branchProducts = branch.stock.map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        soldPrice: item.productId.soldPrice, 
        description: item.productId.description,
        images: item.productId.images.map(img => ({
            fileId: img.fileId,
            filePath: `${process.env.IMAGEKIT_ENDPOINT_URL}${img.filePath}`
        })),
        quantity: item.quantity
    }));

    const branchProductIds = branch.stock.map(item => item.productId._id);
    const availableMainStockProducts = await Product.find({
        _id: { $nin: branchProductIds },  
        mainStock: { $gt: 0 }  
    }).select("name soldPrice description images").lean();

    availableMainStockProducts.forEach(product => {
        product.images = product.images.map(img => ({
            fileId: img.fileId,
            filePath: `${process.env.IMAGEKIT_ENDPOINT_URL}${img.filePath}`
        }));
    });

    return { branchProducts, availableMainStockProducts };
};



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
        throw new AppError(`Failed to create request: ${error.message}`, 500);
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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const request = await Request.findById(id).session(session);
        if (!request) throw new AppError("Request not found", 404);

        const branch = await Branch.findById(request.branchId).session(session);
        if (!branch) throw new AppError("Branch not found", 404);

        const branchStockMap = new Map(branch.stock.map(item => [item.productId.toString(), item]));

        for (let product of request.products) {
            const productInStock = await Product.findById(product.productId).session(session);
            if (!productInStock) throw new AppError(`Product not found: ${product.productId}`, 404);

            if (product.requestedQty > productInStock.mainStock) {
                throw new AppError(
                    `Not enough stock for product "${productInStock.name}". Available: ${productInStock.mainStock}`,
                    400
                );
            }
        }

        for (let product of request.products) {
            const productInStock = await Product.findById(product.productId).session(session);

            productInStock.mainStock -= product.requestedQty;
            await productInStock.save({ session });

            product.approvedQty = product.requestedQty;

            if (branchStockMap.has(product.productId.toString())) {
                branchStockMap.get(product.productId.toString()).quantity += product.requestedQty;
            } else {
                branch.stock.push({
                    productId: product.productId,
                    quantity: product.requestedQty,
                });
            }
        }

        await branch.save({ session }); 

       
        request.status = "approved";
        request.adminResponse = adminResponse;
        await request.save({ session });

        await session.commitTransaction();
        session.endSession();

        return request;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new AppError(error.message || "Failed to approve full request", 500);
    }
};


// Approve Partial Request (Selected products only)
exports.approvePartialRequest = async (id, adminResponse = "", approvedProducts) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const request = await Request.findById(id).session(session);
        if (!request) throw new AppError("Request not found", 404);

        const branch = await Branch.findById(request.branchId).session(session);
        if (!branch) throw new AppError("Branch not found", 404);

        const branchStockMap = new Map(branch.stock.map(item => [item.productId.toString(), item]));

        for (let product of request.products) {
            const approvedProduct = approvedProducts.find(p =>
                new mongoose.Types.ObjectId(p.productId).equals(product.productId)
            );

            if (approvedProduct) {
                const productInStock = await Product.findById(product.productId).session(session);

                if (approvedProduct.approvedQty > productInStock.mainStock) {
                    throw new AppError(
                        `Not enough stock for product "${productInStock.name}". Available: ${productInStock.mainStock}`,
                        400
                    );
                }

                productInStock.mainStock -= approvedProduct.approvedQty;
                await productInStock.save({ session });

                product.approvedQty = approvedProduct.approvedQty;

                if (branchStockMap.has(product.productId.toString())) {
                    branchStockMap.get(product.productId.toString()).quantity += approvedProduct.approvedQty;
                } else {
                    branch.stock.push({
                        productId: product.productId,
                        quantity: approvedProduct.approvedQty,
                    });
                }
            }
        }

        await branch.save({ session });

        request.status = "partially_approved";
        request.adminResponse = adminResponse;
        await request.save({ session });

        await session.commitTransaction();
        session.endSession();

        return request;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new AppError(error.message || "Failed to approve partial request", 500);
    }
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

