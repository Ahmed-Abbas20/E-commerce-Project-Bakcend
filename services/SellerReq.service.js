const {
  createRequest,
  findRequestById,
  updateRequest,
  getPendingRequests
} = require('../repos/sellerRequest.repo');
const {
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts
} = require('../repos/product.repo');
const { isSuperAdmin } = require('../repos/Staff.repo');
const { AppError } = require('../utils/errorHandler');

exports.createSellerRequest = async (sellerId, requestData) => {
  const request = await createRequest({
    seller: sellerId,
    ...requestData
  });
  return request;
};

exports.processRequest = async (requestId, adminId, action, reason) => {
  const admin = await isSuperAdmin(adminId);
  if (!admin) throw new AppError('Unauthorized', 403);

  const request = await findRequestById(requestId);
  if (!request) throw new AppError('Request not found', 404);
  if (request.status !== 'pending') throw new AppError('Request already processed', 400);

  let updatedRequest;
  switch (action) {
    case 'approve':
      updatedRequest = await handleApproval(request);
      break;
    case 'reject':
      updatedRequest = await updateRequest(requestId, { 
        status: 'rejected', 
        rejectionReason: reason,
        processedBy: adminId
      });
      break;
    default:
      throw new AppError('Invalid action', 400);
  }

  return updatedRequest;
};

async function handleApproval(request) {
  let product;
  switch (request.operationType) {
    case 'create':
      product = await handleCreateRequest(request);
      break;
    case 'update':
      product = await handleUpdateRequest(request);
      break;
    case 'delete':
      await handleDeleteRequest(request);
      break;
  }

  return updateRequest(request._id, { 
    status: 'approved',
    processedBy: request.adminId,
    ...(product && { product: product._id })
  });
}

async function handleCreateRequest(request) {
  const exists = await searchProducts(request.productData.name);
  if (exists) throw new AppError('Product name exists', 409);
  
  return createProduct({
    ...request.productData,
    seller: request.seller._id,
    images: request.images.filter(img => img.status === 'committed')
  });
}

async function handleUpdateRequest(request) {
  return updateProduct(request.product._id, {
    ...request.productData,
    images: request.images.filter(img => img.status === 'committed')
  });
}

async function handleDeleteRequest(request) {
  await deleteProduct(request.product._id);
}

exports.getPendingRequests = () => getPendingRequests();