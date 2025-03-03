const Seller = require("../models/seller.model");
const bcrypt = require("bcrypt");
const { uploadUserImage } = require("../services/userImageUpload.service");
const { AppError } = require("../utils/errorHandler");
const mongoose = require("mongoose");
const Product = require("../models/product.model");
const SellersOrder = require("../models/sellersOrder.model");
const Branch = require("../models/branch.model");
const BASE_IMAGE_URL = process.env.IMAGEKIT_ENDPOINT_URL; 
const Order = require("../models/order.model");


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
module.exports.getAllSellers = async (page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    // Get total count of active sellers
    const totalSellers = await Seller.countDocuments({ userType: "seller", isActive: true });

    // Fetch paginated sellers
    const sellers = await Seller.find({ userType: "seller", isActive: true })
      .select("-password -salt")
      .skip(skip)
      .limit(limit);

    // Format seller image file paths
    const formattedSellers = sellers.map(seller => {
      const formattedSeller = seller.toObject();
      if (formattedSeller.image?.filePath) {
        formattedSeller.image.filePath = `${process.env.IMAGEKIT_ENDPOINT_URL}${formattedSeller.image.filePath}`;
      }
      return formattedSeller;
    });

    return {
      sellers: formattedSellers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalSellers / limit),
        limit:totalSellers
      }
    };

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







//Get all my products as a seller
module.exports.getSellerProductsWithBranches = async (sellerId) => {
  try {
    const products = await Product.find({ sellerId }).select("-__v").lean();

    if (!products || products.length === 0) {
      throw new AppError("No products found for this seller", 404);
    }

    // Fetch branches containing those products
    const productIds = products.map((product) => product._id);
    const branches = await Branch.find({ "stock.productId": { $in: productIds } }).lean();

    // Attach branch info to each product
    const enrichedProducts = products.map((product) => {
      const productBranches = branches
        .filter((branch) =>
          branch.stock.some((stockItem) => stockItem.productId.toString() === product._id.toString())
        )
        .map((branch) => {
          const stockItem = branch.stock.find(
            (stockItem) => stockItem.productId.toString() === product._id.toString()
          );
          return {
            branchId: branch._id,
            branchName: branch.name,
            quantityAvailable: stockItem.quantity,
          };
        });

      const images = product.images.map((img) => ({
        fileId: img.fileId,
        filePath: `${BASE_IMAGE_URL}${img.filePath}`,
      }));

      return {
        ...product,
        images,
        branches: productBranches,
      };
    });

    return enrichedProducts;
  } catch (error) {
    throw new AppError(`Error fetching seller products with branches: ${error.message}`, 500);
  }
};



// Delete a seller's address by index
module.exports.deleteSellerAddressByIndex = async (sellerId, index) => {
  try {
    const seller = await Seller.findOne({ _id: sellerId, userType: "seller" });

    if (!seller) {
      throw new AppError("Seller not found", 404);
    }

    if (index < 0 || index >= seller.addresses.length) {
      throw new AppError("Address index out of bounds", 400);
    }

    seller.addresses.splice(index, 1);

    await seller.save();

    return seller.addresses; 
  } catch (error) {
    throw new AppError(`Error deleting address: ${error.message}`, 500);
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
    const sellerProducts = await Product.find({ sellerId }).select("name soldPrice costPrice");

    const sellerOrders = await SellersOrder.find({ sellerId }).populate({
      path: "products.productId",
      select: "name soldPrice costPrice",
    });

    const yearlyData = {};

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    //Process Orders and Group by Year and Month
    sellerOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const orderYear = orderDate.getFullYear();
      const orderMonth = orderDate.getMonth();

      // Initialize the year if it doesn't exist
      if (!yearlyData[orderYear]) {
        yearlyData[orderYear] = Array.from({ length: 12 }, (_, index) => ({
          monthName: monthNames[index],
          ordersCount: 0,
          totalProfit: 0,
          orders: [],
        }));
      }

      // Calculate profit for the order
      let monthlyProfit = 0;
      order.products.forEach(product => {
        const profit = (product.productId.soldPrice - product.productId.costPrice) * product.requiredQty;
        monthlyProfit += profit;
      });

      // Update monthly data for the year
      yearlyData[orderYear][orderMonth].ordersCount += 1;
      yearlyData[orderYear][orderMonth].totalProfit += monthlyProfit;

      // Add order details to the month
      yearlyData[orderYear][orderMonth].orders.push({
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

    // Calculate Most Sold Products
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

    // Calculate Total Profit
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
      yearlyData,
    };
  } catch (error) {
    throw new AppError(`Error fetching seller dashboard data: ${error.message}`, 500);
  }
};


module.exports.getAdminDashboardData = async (filters) => {
  try {
    const currentYear = new Date().getFullYear();
    const { year, sellerId, branchId } = filters;
    const filterQuery = {};

    if (year || sellerId || branchId) {
      if (year) {
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${parseInt(year) + 1}-01-01`);
        filterQuery.createdAt = { $gte: startDate, $lt: endDate };
      }
      if (sellerId) filterQuery.sellerId = sellerId;
    } else {
      const startDate = new Date(`${currentYear}-01-01`);
      const endDate = new Date(`${currentYear + 1}-01-01`);
      filterQuery.createdAt = { $gte: startDate, $lt: endDate };
    }

    let sellersOrderQuery = { ...filterQuery };

    // If filtering by branch, first get related orders
    if (branchId) {
      const ordersWithBranch = await Order.find({ branchId }).select("sellersOrders");
      const sellersOrderIds = ordersWithBranch.flatMap(order => order.sellersOrders.map(so => so.order));

      if (sellersOrderIds.length === 0) {
        return {
          orders: [],
          mostSoldProducts: [],
          yearlyData: {},
          totalProfit: 0,
          totalOrders: 0
        };
      }
      sellersOrderQuery._id = { $in: sellersOrderIds };
    }

    // Fetch filtered orders
    const orders = await SellersOrder.find(sellersOrderQuery).populate({
      path: "products.productId",
      select: "name soldPrice costPrice",
    });

    const yearlyData = {};
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    let totalProfit = 0;
    let totalOrders = 0;

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const orderYear = orderDate.getFullYear();
      const orderMonth = orderDate.getMonth();

      if (!yearlyData[orderYear]) {
        yearlyData[orderYear] = Array.from({ length: 12 }, (_, index) => ({
          monthName: monthNames[index],
          ordersCount: 0,
          totalProfit: 0,
          orders: [],
        }));
      }

      let monthlyProfit = 0;
      order.products.forEach((product) => {
        const profit = (product.productId.soldPrice - product.productId.costPrice) * product.requiredQty;
        monthlyProfit += profit;
      });

      yearlyData[orderYear][orderMonth].ordersCount += 1;
      yearlyData[orderYear][orderMonth].totalProfit += monthlyProfit;
      totalProfit += monthlyProfit;
      totalOrders += 1;

      yearlyData[orderYear][orderMonth].orders.push({
        orderId: order._id,
        createdAt: order.createdAt,
        totalPrice: order.totalPrice,
        totalQty: order.totalQty,
        status: order.status,
        products: order.products.map((product) => ({
          productId: product.productId._id,
          productName: product.productId.name,
          price: product.price,
          requiredQty: product.requiredQty,
          totalPrice: product.totalPrice,
        })),
      });
    });

    // Calculate Most Sold Products
    const productSales = {};
    orders.forEach((order) => {
      order.products.forEach((product) => {
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

    const mostSoldProducts = Object.values(productSales)
      .sort((a, b) => b.soldQty - a.soldQty)
      .slice(0, 3);

    return {
      orders,
      mostSoldProducts,
      yearlyData,
      totalProfit,
      totalOrders,
    };
  } catch (error) {
    throw new AppError(`Error fetching admin dashboard data: ${error.message}`, 500);
  }
};



