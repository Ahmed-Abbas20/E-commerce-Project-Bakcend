const { uploadImages } = require("../services/media.service");
const { AppError } = require("../utils/errorHandler");



/**
 * Upload images for a specific document (Product, User, etc.) and store both fileId and filePath.
 *
 * @param {Object} model - The Mongoose model (e.g., Product, User).
 * @param {string} documentId - The ID of the document (e.g., productId, userId).
 * @param {Array} uploadedFiles - List of images from request.
 * @returns {Promise<Array<Object>>} - Returns an array of objects containing fileId and filePath.
 */


async function handleImageUpload(model, documentId, uploadedFiles) {
  try {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      throw new AppError("No files were uploaded.", 400);
    }

    if (!documentId) {
      throw new AppError("Document ID is required.", 400);
    }

    const document = await model.findById(documentId);
    if (!document) {
      throw new AppError(`${model.modelName} not found.`, 404);
    }

    let folderName;

    
    if (document.images.length > 0) {
      
      folderName = document.images[0].filePath.split("/").slice(0, -1).join("/");
    } else {
      
      folderName = `product_images/${document.name.replace(/\s+/g, "_")}`;
    }

    console.log(`Uploading images to folder: ${folderName}`);

    const uploadPayload = uploadedFiles.map((file) => ({
      src: file.data,
      fileName: file.name || `image_${Date.now()}.jpg`, 
      mimetype: file.mimetype,
      size: file.size,
    }));

    
    const response = await uploadImages({ files: uploadPayload, folderName });

    if (!response || !response.fileDetails) {
      throw new AppError("Image upload failed", 500);
    }

    return response.fileDetails.map(file => ({
      fileId: file.fileId,
      filePath: file.filePath
    }));
  } catch (error) {
    throw new AppError(error.message || "Failed to upload images", error.statusCode || 500);
  }
}

module.exports = { handleImageUpload };










