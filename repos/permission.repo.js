const permissionModel = require("../models/permisssion.model");
const {AppError} = require("../utils/errorHandler");

module.exports.createPermission = async (permission) => {
  try {
    const newPermission = new permissionModel(permission);
    await newPermission.save(); // Save permission to database
    return newPermission; // Return the saved permission object
  } catch (error) {
    throw new AppError("Error creating permission: " + error.message, 400); // Use AppError for handling error
  }
};

module.exports.getPermissions = async () => {
    try {
      const permissions = await permissionModel.find(); // Fetch all permissions
      if (!permissions) {
        throw new AppError("No permissions found", 404); // Custom error if no permissions are found
      }
      return permissions; // Return all permissions
    } catch (error) {
      throw new AppError("Error fetching permissions: " + error.message, 500); // Custom error handling
    }
  };

  module.exports.getPermissionById = async (id) => {
    try {
      const permission = await permissionModel.findById(id); // Find permission by ID
      if (!permission) {
        throw new AppError("Permission not found", 404); // Custom error if permission not found
      }
      return permission; // Return the permission if found
    } catch (error) {
      throw new AppError("Error fetching permission: " + error.message, 500); // Custom error handling
    }
  };

  module.exports.updatePermission = async (id, updatedPermission) => {
    try {
      const permission = await permissionModel.findByIdAndUpdate(
        id, 
        updatedPermission, 
        { new: true } // This option returns the updated document
      );
      if (!permission) {
        throw new AppError("Permission not found", 404); // Custom error if permission not found
      }
      return permission; // Return the updated permission object
    } catch (error) {
      throw new AppError("Error updating permission: " + error.message, 500); // Custom error handling
    }
  };

  module.exports.deletePermission = async (id) => {
    try {
      const permission = await permissionModel.findByIdAndDelete(id); // Find and delete by ID
      if (!permission) {
        throw new AppError("Permission not found", 404); // Custom error if permission not found
      }
      return permission; // Return the deleted permission object
    } catch (error) {
      throw new AppError("Error deleting permission: " + error.message, 500); // Custom error handling
    }
  };

  module.exports.getPermissionByResourceName = async (resource, role, action) => {
    try {
      // Find permission by resource and check if the role is in the 'IN' array of the condition
      const permission = await permissionModel.findOne({
        resource: resource, // Find permission by resource name
        "condition.role.IN": { $in: [role] }, // Ensure the role is authorized
        action: { $in: [action] }, // Check if the action is allowed for this resource
      });
  
      // If permission is not found, handle it as a specific case with 403 error
      if (!permission) {
        // This will return a 403 error with the specific message about permission not found
        throw new AppError(`Permission not found for ${role} to ${action} this ${resource}`, 403);
      }
  
      // If permission found, return the permission object
      return permission;
      
    } catch (error) {
      // Only throw a 500 error for unexpected errors (like DB issues, etc.)
      if (error.statusCode !== 403) {
        throw new AppError("Error fetching permission: " + error.message, 500);
      }
      // If it’s a 403 error, let it pass
      throw error;
    }
  };
  
          