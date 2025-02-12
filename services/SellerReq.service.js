const sellerRequestRepo = require('../repos/SellerReq.repo');
const productRepo = require('../repos/product.repo');
const mediaService = require('./media.service');
const { AppError } = require('../utils/errorHandler');

// Seller services
exports.createSellerRequest = async (sellerId, requestData) => {
  const validOperations = ['create', 'update', 'delete'];
  if (!validOperations.includes(requestData.operationType)) {
    throw new AppError('Invalid operation type', 400);
  }

  return sellerRequestRepo.createRequest({
    seller: sellerId,
    ...requestData
  });
};

exports.updateSellerRequest = async (sellerId, requestId, updateData) => {
  const request = await sellerRequestRepo.findBySellerAndId(sellerId, requestId);
  if (!request) throw new AppError('Request not found', 404);
  if (request.status !== 'pending') throw new AppError('Cannot modify processed request', 400);

  if (updateData.images) {
    const imagesToRemove = request.images
      .filter(img => !updateData.images.some(newImg => newImg.fileId === img.fileId));
    
    if (imagesToRemove.length > 0) {
      await mediaService.deleteProductImages(imagesToRemove.map(img => img.fileId));
    }
  }

  return sellerRequestRepo.updateRequest(requestId, {
    ...updateData,
    status: 'pending' // Reset status on update
  });
};

exports.deleteSellerRequest = async (sellerId, requestId) => {
  const request = await sellerRequestRepo.findBySellerAndId(sellerId, requestId);
  if (!request) throw new AppError('Request not found', 404);
  if (request.status !== 'pending') throw new AppError('Cannot delete processed request', 400);

  if (request.images.length > 0) {
    await mediaService.deleteProductImages(request.images.map(img => img.fileId));
  }

  await sellerRequestRepo.deleteRequest(requestId);
  return { message: 'Request deleted successfully' };
};




// Admin services
exports.processSellerRequest = async (requestId, action, processedBy, rejectionReason) => {
  const request = await sellerRequestRepo.findRequestById(requestId);
  if (!request) throw new AppError('Request not found', 404);
  if (request.status !== 'pending') throw new AppError('Request already processed', 400);

  try {
    if (action === 'approve') {
      switch (request.operationType) {
        case 'create':
          const newProduct = await productRepo.createProduct({
            ...request.productData,
            seller: request.seller,
            images: request.images
          });
          await mediaService.commitImages(request.images.map(img => img.fileId));
          break;
        case 'update':
          await productRepo.updateProduct(
            request.product,
            { ...request.productData, images: request.images }
          );
          await mediaService.commitImages(request.images.map(img => img.fileId));
          break;
        case 'delete':
          await productRepo.deleteProduct(request.product);
          await mediaService.deleteProductImages(request.images.map(img => img.fileId));
          break;
      }
      request.status = 'approved';
    } else if (action === 'reject') {
      request.status = 'rejected';
      request.rejectionReason = rejectionReason;
      await mediaService.deleteProductImages(request.images.map(img => img.fileId));
    } else {
      throw new AppError('Invalid action', 400);
    }

    request.processedBy = processedBy;
    return sellerRequestRepo.updateRequest(requestId, request);
  } catch (error) {
    await mediaService.deleteProductImages(request.images.map(img => img.fileId));
    throw error;
  }
};