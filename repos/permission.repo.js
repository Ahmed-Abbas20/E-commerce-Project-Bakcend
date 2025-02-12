const permissionModel = require("../models/permission.model");
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

  module.exports.getPermissionByResourceName = async (resource, role, action, userId, paramsId) => {
    try {
      // 🚫 Check if there's a DENY rule first
      const denyPermission = await permissionModel.findOne({
        resource: resource,
        effect: "deny",
        "condition.role.IN": { $in: [role] },
        action: { $in: [action] },
      });
  
      if (denyPermission) {
        throw new AppError(`Access denied: ${role} cannot ${action} ${resource}`, 403);
      }
  
      // ✅ Check if there's an ALLOW rule
      let allowPermission = await permissionModel.findOne({
        resource: resource,
        effect: "allow",
        "condition.role.IN": { $in: [role] },
        action: { $in: [action] },
      });
  
      // 🔹 If permission has "self: true", allow only if userId matches paramsId
      if (allowPermission && allowPermission.condition?.self) {
        if (userId !== paramsId) {
          throw new AppError(`You can only ${action} your own profile`, 403);
        }
      }
  
      if (!allowPermission) {
        throw new AppError(`Permission not found: ${role} cannot ${action} ${resource}`, 403);
      }
  
      return allowPermission;
    } catch (error) {
      if (error.statusCode !== 403) {
        throw new AppError("Error fetching permission: " + error.message, 500);
      }
      throw error;
    }
  };
  
  
  
  
  
          