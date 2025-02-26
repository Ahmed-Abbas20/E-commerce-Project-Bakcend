const User = require("../models/base.model");
const { uploadUserImage } = require("../services/userImageUpload.service");
const { AppError } = require("../utils/errorHandler");

// Create a new customer


module.exports.createCustomer = async function ({
  firstName,
  lastName,
  email,
  phone1,
  password,
  salt,
  addresses = [],
  image,
}) {
  try {
   
    const existingCustomer = await User.findOne({ $or: [{ email }, { phone1 }] });
    if (existingCustomer) throw new AppError("Customer with this email or phone already exists", 400);

    
    const customer = new User({
      firstName,
      lastName,
      email,
      phone1,
      password,
      salt,
      userType: "customer",
      addresses: Array.isArray(addresses) ? addresses : [],
      image: image || undefined,
    });

    await customer.save();

    
    const formattedCustomer = customer.toObject();
    delete formattedCustomer.password;
    delete formattedCustomer.salt;

    if (formattedCustomer.image?.filePath) {
      formattedCustomer.image.filePath = `${process.env.IMAGEKIT_ENDPOINT_URL}${formattedCustomer.image.filePath}`;
    }

    return formattedCustomer;

  } catch (error) {
    throw new AppError(`Error creating customer: ${error.message}`, 500);
  }
};



//  Get all customers
module.exports.getAllCustomers = async (page = 1, limit = 20) => {
  try {
    const filters = { userType: "customer", isActive: true };

    const totalCustomers = await User.countDocuments(filters); // Get total count for pagination
    const customers = await User.find(filters, { password: 0, salt: 0 }) 
      .skip((page - 1) * limit) 
      .limit(limit)
      .lean(); 

    customers.forEach(customer => {
      if (customer.image?.filePath) {
        customer.image.filePath = `${process.env.IMAGEKIT_ENDPOINT_URL}${customer.image.filePath}`;
      }
    });

    return {
      customers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCustomers / limit),
        limit:totalCustomers
      }
    };
  } catch (error) {
    throw new AppError(`Error fetching customers: ${error.message}`, 500);
  }
};



//  Get a customer by ID
module.exports.getCustomerById = async (customerId) => {
  try {
    const customer = await User.findOne(
      { _id: customerId, userType: "customer" },
      { password: 0, salt: 0 } 
    ).lean(); // Convert to plain object to modify response

    if (!customer) throw new AppError("Customer not found", 404);

    
    if (customer.image?.filePath) {
      customer.image.filePath = `${process.env.IMAGEKIT_ENDPOINT_URL}${customer.image.filePath}`;
    }

    return customer;
  } catch (error) {
    throw new AppError(`Error fetching customer: ${error.message}`, 500);
  }
};


//  Update a customer
module.exports.updateCustomer = async (customerId, updatedData, uploadedFile = []) => {
  try {
    const existingCustomer = await User.findOne({ _id: customerId, userType: "customer" });

    if (!existingCustomer) {
      throw new AppError("Customer not found", 404);
    }

    
    const imageUpdate = await uploadUserImage(existingCustomer.image?.fileId, uploadedFile);
    if (imageUpdate) {
      updatedData.image = imageUpdate;
    }

    
    Object.assign(existingCustomer, updatedData);
    await existingCustomer.save();

    
    const formattedCustomer = existingCustomer.toObject();
    delete formattedCustomer.password;
    delete formattedCustomer.salt;

   
    if (formattedCustomer.image?.filePath) {
      formattedCustomer.image.filePath = `${process.env.IMAGEKIT_ENDPOINT_URL}${formattedCustomer.image.filePath}`;
    }

    return formattedCustomer;

  } catch (error) {
    throw new AppError(`Error updating customer: ${error.message}`, 500);
  }
};



//  Get a customer's addresses
module.exports.getCustomerAddresses = async (customerId) => {
  try {
    const customer = await User.findOne(
      { _id: customerId, userType: "customer" },
      { addresses: 1, _id: 0 } 
    );

    if (!customer) throw new AppError("Customer not found", 404);

    return customer.addresses;
  } catch (error) {
    throw new AppError(`Error fetching customer addresses: ${error.message}`, 500);
  }
};



//  Add a new address to a customer
module.exports.addCustomerAddress = async (customerId, newAddress) => {
  try {
    const customer = await User.findOne({ _id: customerId, userType: "customer" });

    if (!customer) {
      throw new AppError("Customer not found", 404);
    }

   
    customer.addresses.push(newAddress);

    await customer.save();

    return customer.addresses; // Return updated addresses
  } catch (error) {
    throw new AppError(`Error adding address: ${error.message}`, 500);
  }
};

// Delete a customer's address by index
module.exports.deleteCustomerAddressByIndex = async (customerId, index) => {
  try {
    const customer = await User.findOne({ _id: customerId, userType: "customer" });

    if (!customer) {
      throw new AppError("Customer not found", 404);
    }

    if (index < 0 || index >= customer.addresses.length) {
      throw new AppError("Address index out of bounds", 400);
    }

    customer.addresses.splice(index, 1);

    await customer.save();

    return customer.addresses; 
  } catch (error) {
    throw new AppError(`Error deleting address: ${error.message}`, 500);
  }
};


//  Delete a customer
module.exports.deleteCustomer = async (customerId) => {
  try {
    const deletedCustomer = await User.findOneAndDelete({ _id: customerId, userType: "customer" });
    if (!deletedCustomer) throw new AppError("Customer not found", 404);

    return deletedCustomer;
  } catch (error) {
    throw new AppError(`Error deleting customer: ${error.message}`, 500);
  }
};
