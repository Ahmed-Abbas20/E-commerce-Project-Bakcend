const { APP_CONFIG } = require("../config/app.config");
const ImageKit = require("imagekit");
const { AppError } = require("../utils/errorHandler");


const {
  IMAGEKIT_ENDPOINT_URL,
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY,
} = APP_CONFIG;

const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_ENDPOINT_URL,
});

// Allowed formats and max size (5MB)
const allowedFormats = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * Upload images to ImageKit inside a specific folder with unique filenames.
 * @param {Object} options - Upload parameters.
 * @param {Array} options.files - List of files to upload.
 * @param {string} options.folderName - Folder in ImageKit (e.g., "product_images/ProductName").
 * @returns {Promise<{ success: boolean, fileDetails: Array<{ fileId: string, filePath: string }>, errors: Array<string> }> }
 */
async function uploadImages({ files, folderName }) {
  try {
    if (!Array.isArray(files) || files.length === 0) {
      throw new AppError("No files provided for upload!", 400);
    }

    if (!folderName) {
      throw new AppError("Folder name is required!", 400);
    }

    const uploadPromises = files.map(async (file) => {
      try {
        if (!allowedFormats.includes(file.mimetype)) {
          throw new AppError(
            `Unsupported file format: ${file.mimetype}. Allowed formats: JPG, PNG, GIF, WEBP`,
            400
          );
        }

        if (file.size > MAX_IMAGE_SIZE) {
          throw new AppError(`File ${file.fileName || "Unknown"} is too large. Max size is 5MB.`, 400);
        }

        
        const result = await imagekit.upload({
          file: file.src,
          fileName: file.fileName || `image_${Date.now()}.jpg`,
          folder: `/${folderName}`,
          useUniqueFileName: true, 
        });

        
        const fileId = result.fileId;
        const fileExtension = result.filePath.split(".").pop(); 
        const newFileName = `${fileId}_${file.fileName}` || `image_${Date.now()}.${fileExtension}`;
        const finalResult = await imagekit.upload({
          file: result.url, 
          fileName: newFileName,
          folder: `/${folderName}`,
          useUniqueFileName: false, 
        });

        
        await imagekit.deleteFile(fileId);

        return { fileId: finalResult.fileId, filePath: finalResult.filePath }; 
      } catch (uploadError) {
        throw new AppError(`Error uploading file ${file.fileName || "Unknown"}: ${uploadError.message}`, 500);
      }
    });

    const uploadResults = await Promise.allSettled(uploadPromises);

    const successfulUploads = uploadResults
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    return { success: successfulUploads.length > 0, fileDetails: successfulUploads };
  } catch (error) {
    throw new AppError(error.message || "File upload failed", error.statusCode || 500);
  }
}





/**
 * Delete images from ImageKit using their stored `fileId`s.
 * @param {Array<string>} imageFileIds - List of `fileId`s to delete from ImageKit.
 */
async function deleteProductImages(imageFileIds) {
  try {
    if (!imageFileIds || imageFileIds.length === 0) {
      throw new AppError("No valid image IDs found to delete.", 400);
    }

   
    const existingFiles = await imagekit.listFiles();
    const availableFileIds = existingFiles.map(file => file.fileId);

   
    const validFileIds = imageFileIds.filter(fileId => availableFileIds.includes(fileId));

    if (validFileIds.length === 0) {
      return;
    }

   
    const deleteResults = await Promise.allSettled(
      validFileIds.map(fileId => imagekit.deleteFile(fileId))
    );

    deleteResults.forEach((result, index) => {
      if (result.status === "rejected") {
        throw new AppError(`Failed to delete file ${validFileIds[index]}`, 500);
      }
    });

  } catch (error) {
    throw new AppError(error.message || "Image deletion failed", 500);
  }
}





module.exports = { uploadImages ,deleteProductImages};