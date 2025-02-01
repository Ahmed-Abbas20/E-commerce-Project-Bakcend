const {
    getPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    getPermissionById,
    getPermissionByResourceName
  } = require("../repos/permission.repo");
  
  const AppError = require("../utils/appError"); // Importing the custom error class
  
  module.exports.getPermissions = async () => {
    try {
      return await getPermissions();
    } catch (error) {
      throw new AppError("Error fetching permissions: " + error.message, 500); // Custom error handling
    }
  };
  
  module.exports.createPermission = async (permissionData) => {
    try {
      return await createPermission(permissionData);
    } catch (error) {
      throw new AppError("Error creating permission: " + error.message, 400); // Custom error handling
    }
  };
  
  module.exports.updatePermission = async (permissionId, updatedData) => {
    try {
      return await updatePermission(permissionId, updatedData);
    } catch (error) {
      throw new AppError("Error updating permission: " + error.message, 400); // Custom error handling
    }
  };
  
  module.exports.deletePermission = async (permissionId) => {
    try {
      return await deletePermission(permissionId);
    } catch (error) {
      throw new AppError("Error deleting permission: " + error.message, 404); // Custom error handling
    }
  };
  
  module.exports.getPermissionById = async (permissionId) => {
    try {
      const permission = await getPermissionById(permissionId);
      if (!permission) {
        throw new AppError("Permission not found", 404); // Custom error handling if permission is not found
      }
      return permission;
    } catch (error) {
      throw new AppError("Error fetching permission by ID: " + error.message, 500); // Custom error handling
    }
  };
  
  module.exports.getPermissionByResourceName = async (resourceName) => {
    try {
      const permission = await getPermissionByResourceName(resourceName);
      if (!permission) {
        throw new AppError("Permission not found for this resource", 404); // Custom error handling if permission is not found
      }
      return permission;
    } catch (error) {
      throw new AppError("Error fetching permission by resource name: " + error.message, 500); // Custom error handling
    }
  };
  