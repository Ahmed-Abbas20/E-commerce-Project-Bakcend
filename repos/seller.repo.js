const Seller = require("../models/seller.model");
const bcrypt = require("bcrypt");
const { uploadUserImage } = require("../services/userImageUpload.service");
const { AppError } = require("../utils/errorHandler");
const mongoose = require("mongoose");
const Product = require("../models/product.model");
const SellersOrder = require("../models/sellersOrder.model");

// Create a new seller
module.exports.createSeller = async ({ firstName, lastName, email, phone1, password, companyName, companyRegistrationNumber, SSN, salt }) => {
  try {
   
    const existingSeller = await Seller.findOne({ $or: [{ email }, { phone1 }] });
    if (existingSeller) throw new AppError("Seller with this email or phone already exists", 400);

    const seller = new Seller({
      firstName,
      lastName,
      email,
      phone1,
      userType: "seller",
      password,
      salt,     
      companyName,
      companyRegistrationNumber,
      SSN,
    });

    await seller.save();

    
    const formattedSeller = seller.toObject();
    delete formattedSeller.password;
    delete formattedSeller.salt;

    if (formattedSeller.image?.filePath) {
      formattedSeller.image.filePath = `${process.env.IMAGEKIT_ENDPOINT_URL}${formattedSeller.image.filePath}`;
    }

    return formattedSeller;
  } catch (error) {
    throw new AppError(`Error creating seller: ${error.message}`, 500);
  }
};


// Get all sellers
module.exports.getAllSellers = async () => {
  try {
    const sellers = await Seller.find({ userType: "seller", isActive: true }).select("-password -salt");

    return sellers.map(seller => {
      const formattedSeller = seller.toObject();
      if (formattedSeller.image?.filePath) {
        formattedSeller.image.filePath = `${process.env.IMAGEKIT_ENDPOINT_URL}${formattedSeller.image.filePath}`;
      }
      return formattedSeller;
    });
  } catch (error) {
    throw new AppError(`Error fetching sellers: ${error.message}`, 500);
  }
};

// Get a seller by ID
module.exports.getSellerById = async (sellerId) => {
  try {
    const seller = await Seller.findOne({ _id: sellerId, userType: "seller" }).select("-password -salt");
    if (!seller) throw new AppError("Seller not found", 404);

    const formattedSeller = seller.toObject();
    if (formattedSeller.image?.filePath) {
      formattedSeller.image.filePath = `${process.env.IMAGEKIT_ENDPOINT_URL}${formattedSeller.image.filePath}`;
    }

    return formattedSeller;
  } catch (error) {
    throw new AppError(`Error fetching seller: ${error.message}`, 500);
  }
};

// Update a seller
module.exports.updateSeller = async (sellerId, updatedData, uploadedFile = []) => {
  try {
    const existingSeller = await Seller.findOne({ _id: sellerId, userType: "seller" });
    if (!existingSeller) throw new AppError("Seller not found", 404);

    // ✅ Handle image upload (if a new image is uploaded)
    const imageUpdate = await uploadUserImage(existingSeller.image?.fileId, uploadedFile);
    if (imageUpdate) updatedData.image = imageUpdate;

    Object.assign(existingSeller, updatedData);
    await existingSeller.save();

    const formattedSeller = existingSeller.toObject();
    delete formattedSeller.password;
    delete formattedSeller.salt;

    if (formattedSeller.image?.filePath) {
      formattedSeller.image.filePath = `${process.env.IMAGEKIT_ENDPOINT_URL}${formattedSeller.image.filePath}`;
    }

    return formattedSeller;
  } catch (error) {
    throw new AppError(`Error updating seller: ${error.message}`, 500);
  }
};



// Get a Seller's Addresses
module.exports.getSellerAddresses = async (sellerId) => {
  try {
    const seller = await Seller.findOne(
      { _id: sellerId, userType: "seller" },
      { addresses: 1, _id: 0 }
    );

    if (!seller) throw new AppError("Seller not found", 404);

    return seller.addresses;
  } catch (error) {
    throw new AppError(`Error fetching seller addresses: ${error.message}`, 500);
  }
};

// Add a New Address to a Seller
module.exports.addSellerAddress = async (sellerId, newAddress) => {
  try {
    const seller = await Seller.findOne({ _id: sellerId, userType: "seller" });

    if (!seller) {
      throw new AppError("Seller not found", 404);
    }

    seller.addresses.push(newAddress);
    await seller.save();

    return seller.addresses; // Return updated addresses
  } catch (error) {
    throw new AppError(`Error adding address: ${error.message}`, 500);
  }
};

// Delete a seller
module.exports.deleteSeller = async (sellerId) => {
  try {
    const deletedSeller = await Seller.findOneAndDelete({ _id: sellerId, userType: "seller" });
    if (!deletedSeller) throw new AppError("Seller not found", 404);
    return deletedSeller;
  } catch (error) {
    throw new AppError(`Error deleting seller: ${error.message}`, 500);
  }
};

module.exports.getSellerDashboardData = async (sellerId) => {
  try {
    //products
    const sellerProducts = await Product.find({ sellerId }).select("_id name soldPrice costPrice");
//orders
    const sellerOrders = await SellersOrder.find({ sellerId }).populate({
      path: "products.productId",
      select: "name soldPrice costPrice",
    });
//monthly details
    const monthlyData = Array.from({ length: 12 }, () => ({
      ordersCount: 0,
      totalProfit: 0,
      orders: [],
    }));

    sellerOrders.forEach(order => {
      const orderMonth = new Date(order.createdAt).getMonth();
      let monthlyProfit = 0;
      order.products.forEach(product => {
        const profit = (product.productId.soldPrice - product.productId.costPrice) * product.requiredQty;
        monthlyProfit += profit;
      });

      monthlyData[orderMonth].ordersCount += 1;
      monthlyData[orderMonth].totalProfit += monthlyProfit;

      monthlyData[orderMonth].orders.push({
        orderId: order._id,
        createdAt: order.createdAt,
        totalPrice: order.totalPrice,
        totalQty: order.totalQty,
        status: order.status,
        products: order.products.map(product => ({
          productId: product.productId._id,
          productName: product.productId.name,
          price: product.price,
          requiredQty: product.requiredQty,
          totalPrice: product.totalPrice,
        })),
      });
    });

    //most sold products
    const productSales = {};
    sellerOrders.forEach(order => {
      order.products.forEach(product => {
        const productId = product.productId._id.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            productId: product.productId._id,
            productName: product.productId.name,
            soldQty: 0,
            totalRevenue: 0,
            totalProfit: 0,
          };
        }
        productSales[productId].soldQty += product.requiredQty;
        productSales[productId].totalRevenue += product.totalPrice;
        productSales[productId].totalProfit += (product.productId.soldPrice - product.productId.costPrice) * product.requiredQty;
      });
    });

    const mostSoldProducts = Object.values(productSales).sort((a, b) => b.soldQty - a.soldQty);

    // total profit
    let totalProfit = 0;
    sellerOrders.forEach(order => {
      order.products.forEach(product => {
        totalProfit += (product.productId.soldPrice - product.productId.costPrice) * product.requiredQty;
      });
    });

    return {
      sellerProducts,
      sellerOrders,
      mostSoldProducts,
      totalProfit,
      monthlyData,
    };
  } catch (error) {
    throw new AppError(`Error fetching seller dashboard data: ${error.message}`, 500);
  }
};