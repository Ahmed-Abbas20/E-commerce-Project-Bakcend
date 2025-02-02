const User = require("../models/base.model"); 
const Staff = require("../models/staff.model"); 
const bcrypt = require("bcrypt");
const { AppError } = require("../utils/errorHandler");

// Get all cashiers
module.exports.getCashiers = async () => {
  try {
    const cashiers = await Staff.find({ role: "cashier" }).populate("managerId", "firstName lastName email");
    return cashiers;
  } catch (error) {
    throw new AppError("Error fetching cashiers: " + error.message, 500);
  }
};

// Create a new cashier
module.exports.createCashier = async ({ firstName, lastName, email, password, phone1, SSN, managerId }) => {
  try {
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

   
    const cashierData = {
      firstName,
      lastName,
      email,
      phone1,
      userType: "staff",
      password: hashedPassword,
      salt,
      role: "cashier",
      SSN,
      managerId,
    };

    let cashier = new Staff(cashierData);

    
    await cashier.save();

    
    const claims = {
      sub: cashier._id,
      email: cashier.email,
      userType: cashier.userType,
      role: cashier.role,
    };

    return claims;
  } catch (error) {
    throw new AppError("Error creating cashier: " + error.message, 500);
  }
};

// Update a cashier
module.exports.updateCashier = async (cashierId, updatedData) => {
  try {
    const updatedCashier = await Staff.findByIdAndUpdate(cashierId, updatedData, { new: true });

    if (!updatedCashier) {
      throw new AppError("Cashier not found", 404);
    }

    return updatedCashier;
  } catch (error) {
    throw new AppError("Error updating cashier: " + error.message, 500);
  }
};

// Delete a cashier
module.exports.deleteCashier = async (cashierId) => {
  try {
    const deletedCashier = await Staff.findByIdAndDelete(cashierId);
    
    if (!deletedCashier) {
      throw new AppError("Cashier not found", 404);
    }

    return deletedCashier;
  } catch (error) {
    throw new AppError("Error deleting cashier: " + error.message, 500);
  }
};

// Get a cashier by email
module.exports.getCashierByEmail = async (email) => {
  try {
    const cashier = await Staff.findOne({ email, role: "cashier" });

    if (!cashier) {
      throw new AppError("Cashier not found", 404);
    }

    return cashier;
  } catch (error) {
    throw new AppError("Error fetching cashier by email: " + error.message, 500);
  }
};
