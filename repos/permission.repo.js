const permissionModel = require("../models/permisssion.model");
const {AppError} = require("../utils/errorHandler");

module.exports.createPermission = async (permission) => {
  try {
    const newPermission = new permissionModel(permission);
    await newPermission.save(); 
    return newPermission; 
  } catch (error) {
    throw new AppError("Error creating permission: " + error.message, 400); 
  }
};

module.exports.getPermissions = async () => {
    try {
      const permissions = await permissionModel.find(); 
      if (!permissions) {
        throw new AppError("No permissions found", 404); 
      }
      return permissions; // Return all permissions
    } catch (error) {
      throw new AppError("Error fetching permissions: " + error.message, 500); 
    }
  };

  module.exports.getPermissionById = async (id) => {
    try {
      const permission = await permissionModel.findById(id); 
      if (!permission) {
        throw new AppError("Permission not found", 404); 
      }
      return permission; 
    } catch (error) {
      throw new AppError("Error fetching permission: " + error.message, 500); 
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
        throw new AppError("Permission not found", 404); 
      }
      return permission; // Return the updated permission object
    } catch (error) {
      throw new AppError("Error updating permission: " + error.message, 500); 
    }
  };

  module.exports.deletePermission = async (id) => {
    try {
      const permission = await permissionModel.findByIdAndDelete(id); 
      if (!permission) {
        throw new AppError("Permission not found", 404); 
      }
      return permission; // Return the deleted permission object
    } catch (error) {
      throw new AppError("Error deleting permission: " + error.message, 500); 
    }
  };

  module.exports.getPermissionByResourceName = async (resource, role, action) => {
    try {
      // Find permission by resource and check if the role is in the 'IN' array of the condition
      const permission = await permissionModel.findOne({
        resource: resource, 
        "condition.role.IN": { $in: [role] }, 
        action: { $in: [action] }, 
      });
  
      
      if (!permission) {
       
        throw new AppError(`Permission not found for ${role} to ${action} this ${resource}`, 403);
      }
  
     
      return permission;
      
    } catch (error) {
    
      if (error.statusCode !== 403) {
        throw new AppError("Error fetching permission: " + error.message, 500);
      }
      // If it’s a 403 error, let it pass
      throw error;
    }
  };
  
          