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

  module.exports.getPermissionByResourceName = async (resource, userRole, action, context) => {
    console.log(`🛠️ Fetching permission for resource: ${resource}, role: ${userRole}, action: ${action}`);
    console.log("🛠️ Evaluating Permission Context:", context);
  
    const sellerId = context.params?.sellerId; // ✅ Extract sellerId correctly
  
    const permission = await permissionModel.findOne({
      resource,
      action: { $in: [action] },
      $or: [
        { "condition.role.IN": { $in: [userRole] } },  // ✅ Match super_admin or manager
        { "condition.requester.id": sellerId }  // ✅ Match seller updating their own profile
      ]
    });
  
    if (!permission) {
      console.log("❌ No matching permission found!");
      return null;
    }
  
    console.log("✅ Found Permission:", permission);
    return permission;
  };
  
  
  
  
          