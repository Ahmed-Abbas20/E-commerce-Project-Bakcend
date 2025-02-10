// const imagekit = require('../config/imagekit');
// const { AppError } = require('../utils/errorHandler');

// exports.uploadProductImages = async (req, res, next) => {
//   try {
//     if (!req.files || req.files.length === 0) return next();
    
//     const uploadPromises = req.files.map(file => 
//       imagekit.upload({
//         file: file.buffer,
//         fileName: file.originalname,
//         folder: '/pending-products'
//       })
//     );

//     const images = await Promise.all(uploadPromises);
//     req.uploadedImages = images.map(img => ({
//       fileId: img.fileId,
//       filePath: img.filePath,
//       status: 'pending'
//     }));

//     next();
//   } catch (error) {
//     next(new AppError('Image upload failed', 500));
//   }
// };

// exports.cleanupImages = async (req, res, next) => {
//   try {
//     if (req.uploadedImages) {
//       await Promise.all(
//         req.uploadedImages.map(img => 
//           imagekit.deleteFile(img.fileId)
//         )
//       );
//     }
//     next();
//   } catch (error) {
//     next(new AppError('Image cleanup failed', 500));
//   }
// };