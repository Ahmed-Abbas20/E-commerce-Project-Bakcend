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

// ✅ Function to handle image upload and return relative path
module.exports.uploadUserImage = async (existingFileId, uploadedFile) => {
  try {
    if (!uploadedFile || uploadedFile.length === 0) {
      return null; // No new image uploaded
    }

    // ✅ Delete previous image if it exists
    if (existingFileId) {
      await imagekit.deleteFile(existingFileId);
    }

    // ✅ Upload the new image to `/users/` folder
    const file = uploadedFile[0];
    const uploadResponse = await imagekit.upload({
      file: file.data,
      fileName: file.name || `image_${Date.now()}.jpg`,
      folder: "/users",
      useUniqueFileName: true,
    });

    // ✅ Return the new image data with relative path
    return {
      fileId: uploadResponse.fileId,
      filePath: `/users/${uploadResponse.name}`, // Only store relative path
    };
  } catch (error) {
    throw new AppError(`Image upload failed: ${error.message}`, 500);
  }
};
