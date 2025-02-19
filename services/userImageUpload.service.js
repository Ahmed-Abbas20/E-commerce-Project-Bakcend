const ImageKit = require("imagekit");
const { AppError } = require("../utils/errorHandler");
const { APP_CONFIG } = require("../config/app.config");

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

const DEFAULT_IMAGE_ID = "67b63936432c47641646f3ae"; 

module.exports.uploadUserImage = async (existingFileId, uploadedFile) => {
  try {
    if (!uploadedFile || uploadedFile.length === 0) {
      return null; 
    }

    
    if (existingFileId && existingFileId !== DEFAULT_IMAGE_ID) {
      await imagekit.deleteFile(existingFileId);
    }

    
    const file = uploadedFile[0];
    const uploadResponse = await imagekit.upload({
      file: file.data,
      fileName: file.name || `image_${Date.now()}.jpg`,
      folder: "/users",
      useUniqueFileName: true,
    });

    
    return {
      fileId: uploadResponse.fileId,
      filePath: `/users/${uploadResponse.name}`, 
    };
  } catch (error) {
    throw new AppError(`Image upload failed: ${error.message}`, 500);
  }
};

