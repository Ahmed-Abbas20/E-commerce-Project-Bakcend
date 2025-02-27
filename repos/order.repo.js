const Branch = require("../models/branch.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const User = require("../models/base.model");
const Staff = require("../models/staff.model");
const { AppError } = require("../utils/errorHandler");
const SellersOrder = require("../models/sellersOrder.model"); 



async function saveSellersOrders(sellersOrders) {
    const createdSellersOrders = await SellersOrder.insertMany(sellersOrders);
    return createdSellersOrders.map(order => order._id); 
}



// Add Product to Order
module.exports.addProductToOrder = async (productId, userId = null, branchId = null) => {
  try {
    let targetBranchId = branchId;

    if (!targetBranchId) {
      const user = await Staff.findById(userId).select("branchId");
      if (!user || !user.branchId) throw new AppError("User's branch not found", 400);
      targetBranchId = user.branchId;
    }

    const branch = await Branch.findById(targetBranchId);
    if (!branch) throw new AppError("Branch not found", 404);

    const productInBranch = branch.stock.find(item => item.productId.toString() === productId);
    if (!productInBranch) throw new AppError("Product not available in assigned branch stock", 404);

    const product = await Product.findById(productId).select("name categoryName images soldPrice").lean();
    if (!product) throw new AppError("Product details not found", 404);

    return {
      productId: product._id,
      name: product.name,
      category: product.categoryName,
      quantityAvailable: productInBranch.quantity,
      price: product.soldPrice,
    };
  } catch (error) {
    throw new AppError(`Error fetching product details: ${error.message}`, 500);
  }
};

  
  
// Create Online Order (Fetch Products from Cart)
module.exports.createOnlineOrder = async (userId, addressIndex, paymentMethod, customerNotes,products) => {
    try {
      const user = await User.findById(userId).select("addresses phone1");
      if (!user || !user.addresses || addressIndex >= user.addresses.length)
        throw new AppError("Invalid address index", 400);
  
      const address = user.addresses[addressIndex];
      const phone = user.phone1;

  
      const websiteBranch = await Branch.findOne({ name: "Website Branch" });
      if (!websiteBranch) throw new AppError("Website Branch not found", 404);
  
      const { validProducts, totalPrice, totalQty, sellersOrders, changes } = await processOrderItems(products, websiteBranch);
      if (changes.length > 0) return { success: false, message: "Some products have stock issues", changes };
  
      const order = await saveOnlineOrder(userId, websiteBranch._id, paymentMethod, customerNotes, address, phone, validProducts, totalPrice, totalQty, sellersOrders);
      
      await Cart.findOneAndUpdate({ userId }, { $set: { products: [] } });
  
      return { success: true, order };
    } catch (error) {
      throw new AppError(`Error creating online order: ${error.message}`, 500);
    }
  };
  

// Create Offline Order
module.exports.createOfflineOrder = async (cashierId, customerName, phone, paymentMethod, products) => {
    try {
      const cashier = await Staff.findById(cashierId).select("branchId");
      if (!cashier || !cashier.branchId) throw new AppError("Cashier does not have a branch assigned", 400);
  
      const branch = await Branch.findById(cashier.branchId);
      if (!branch) throw new AppError("Branch not found", 404);
  
      const { validProducts, totalPrice, totalQty, sellersOrders, changes } = await processOrderItems(products, branch);
      if (changes.length > 0) return { success: false, message: "Some products have stock issues", changes };
  
      const order = await saveOfflineOrder(
        cashierId,
        branch._id,
        paymentMethod,
        phone,
        validProducts,
        totalPrice,
        totalQty,
        customerName,
        sellersOrders,
      );
  
      return { success: true, order };
    } catch (error) {
      throw new AppError(`Error creating offline order: ${error.message}`, 500);
    }
  };



// Get Customer Orders by Customer ID
module.exports.getCustomerOrders = async (customerId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    
    const orders = await Order.find({ customerId })
      .populate("branchId", "name location")
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({ customerId });

    return {
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new AppError(`Error fetching customer orders: ${error.message}`, 500);
  }
};


// Get Online Customer Orders
module.exports.getOnlineCustomerOrders = async (customerId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const orders = await Order.find({ customerId, orderType: "online" })
      .select("-branchId")
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({ customerId, orderType: "online" });

    return {
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new AppError(`Error fetching online customer orders: ${error.message}`, 500);
  }
};




// Get Seller Orders by Seller ID (from params)
module.exports.getSellerOrders = async (sellerId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    // Get total count of orders for pagination
    const totalOrders = await SellersOrder.countDocuments({ sellerId });

    // Fetch paginated orders
    const orders = await SellersOrder.find({ sellerId })
      .skip(skip)
      .limit(limit);

    return {
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
      },
    };
  } catch (error) {
    throw new AppError(`Error fetching seller orders: ${error.message}`, 500);
  }
};


// Get Orders of the Branch (from token)
module.exports.getBranchOrders = async (branchId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    // Get total count of orders for pagination
    const totalOrders = await Order.countDocuments({ branchId });

    // Fetch paginated orders
    const orders = await Order.find({ branchId })
      .populate("customerId", "firstName lastName phone1")
      .skip(skip) 
      .limit(limit);

    return {
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        limit:totalOrders,
      },
    };
  } catch (error) {
    throw new AppError(`Error fetching branch orders: ${error.message}`, 500);
  }
};


module.exports.getOrderById = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate("branchId", "name");
    if (!order) {
      throw new AppError("Order not found", 404);
    }
    return order;
  } catch (error) {
    throw new AppError(`Error fetching order: ${error.message}`, 500);
  }
};

// Update Order (also update related Seller Orders)
module.exports.updateOrder = async (orderId, updatedData) => {
  try {
    const order = await Order.findById(orderId);

    if (!order) throw new AppError("Order not found", 404);

    if (order.orderType !== "online") {
      throw new AppError("Only online orders can have status updates", 400);
    }

    if (updatedData.status === "cancelled") {
      throw new AppError("You cannot update the order status to cancelled", 400);
    }

    order.status = updatedData.status;
    await order.save();

    await SellersOrder.updateMany(
      { _id: { $in: order.sellersOrders.map(sellerOrder => sellerOrder.order) } },
      { status: updatedData.status }
    );

    return order;
  } catch (error) {
    throw new AppError(`Error updating order: ${error.message}`, 500);
  }
};






// Cancel Order (also cancel related Seller Orders)
module.exports.cancelOrder = async (orderId, userRole, userBranchId) => {
  try {
    const session = await Order.startSession();
    session.startTransaction();

    try {
      let order = await Order.findById(orderId)
        .populate({
          path: "products.productId",
          select: "name soldPrice",
        })
        .populate("branchId")
        .session(session);

      if (!order) throw new AppError("Order not found", 404);

      if (userRole === "manager" && order.branchId.toString() !== userBranchId) {
        throw new AppError("You are not authorized to cancel this order", 403);
      }

      for (const item of order.products) {
        if (!item.price) {
          item.price = item.productId.soldPrice || 0;
        }
      }

      order.status = "cancelled";
      await order.save({ session });

      await SellersOrder.updateMany(
        { _id: { $in: order.sellersOrders.map(sellerOrder => sellerOrder.order) } },
        { status: "cancelled" },
        { session }
      );

      const branch = await Branch.findById(order.branchId).session(session);
      if (!branch) throw new AppError("Branch not found", 404);

      for (const item of order.products) {
        const stockItem = branch.stock.find(stock => stock.productId.toString() === item.productId._id.toString());

        if (stockItem) {
          stockItem.quantity += item.requiredQty;
        } else {
          branch.stock.push({
            productId: item.productId._id,
            quantity: item.requiredQty,
          });
        }
      }

      await branch.save({ session });

      await session.commitTransaction();
      session.endSession();

      const updatedOrder = await Order.findById(orderId)
        .populate({
          path: "products.productId",
          select: "name soldPrice",
        })
        .populate("branchId")
        .populate("sellersOrders.order"); 

      return updatedOrder; 

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new AppError(`Error cancelling order: ${error.message}`, 500);
    }
  } catch (error) {
    throw new AppError(`Error cancelling order: ${error.message}`, 500);
  }
};




  
//  Process Products & Validate Stock
async function processOrderItems(products, branch) {
  const changes = [];
  const validProducts = [];
  let totalPrice = 0;
  let totalQty = 0;
  const sellersOrders = new Map();

  for (const item of products) {
      
      const productInBranch = branch.stock.find(stockItem => stockItem.productId.toString() === item.productId.toString());
      if (!productInBranch || productInBranch.quantity < item.requiredQty) {
          changes.push({ productId: item.productId, status: `Insufficient stock` });
          continue;
      }

      const product = await Product.findById(item.productId).select("name categoryName images sellerId soldPrice");
      if (!product) {
          changes.push({ productId: item.productId, status: "Product details not found" });
          continue;
      }

      const itemTotalPrice = product.soldPrice * item.requiredQty;
      const formattedImages = product.images.map(img => ({
          fileId: img.fileId,
          filePath: `${process.env.IMAGEKIT_ENDPOINT_URL}${img.filePath}`
      }));

      validProducts.push({
          productId: product._id,
          productName: product.name,
          price: product.soldPrice,
          requiredQty: item.requiredQty, 
          totalPrice: itemTotalPrice,
          productImages: formattedImages,  
      });

      totalPrice += itemTotalPrice;
      totalQty += item.requiredQty;
      productInBranch.quantity -= item.requiredQty;

      // Group products by sellerId
      if (!sellersOrders.has(product.sellerId.toString())) {
          sellersOrders.set(product.sellerId.toString(), {
              sellerId: product.sellerId,
              products: [],
              totalPrice: 0,
              totalQty: 0,
          });
      }

      const sellerOrder = sellersOrders.get(product.sellerId.toString());
      sellerOrder.products.push({
          productId: product._id,
          productName: product.name,
          category: product.categoryName,
          productImages: formattedImages, 
          price: product.soldPrice,
          totalPrice: itemTotalPrice,
          requiredQty: item.requiredQty,
      });

      sellerOrder.totalPrice += itemTotalPrice;
      sellerOrder.totalQty += item.requiredQty;
  }

  await branch.save();
  return { 
      validProducts, 
      totalPrice, 
      totalQty, 
      sellersOrders: Array.from(sellersOrders.values()), 
      changes 
  };
}


  

// Save Online Order 
async function saveOnlineOrder(customerId, branchId, paymentMethod, customerNotes, address, phone, products, totalPrice, totalQty, sellersOrders) {
  const sellerOrderIds = await saveSellersOrders(sellersOrders);

  const order = await new Order({
    customerId,
    branchId,
    orderType: "online",
    paymentMethod,
    customerNotes,
    address,
    phone,
    products,
    totalPrice,
    totalQty,
    status:"pending",
    sellersOrders: sellerOrderIds.map(orderId => ({ order: orderId })),
  }).save();

  


  return order;
}



  

// Save Offline Order 
async function saveOfflineOrder(cashierId, branchId, paymentMethod, phone, products, totalPrice, totalQty, customerName, sellersOrders) {
  const sellerOrderIds = await saveSellersOrders(sellersOrders);

  const order = await new Order({
    cashierId,
    branchId,
    orderType: "offline",
    paymentMethod,
    phone,
    customerName,
    products,
    totalPrice,
    totalQty,
    status:"delivered",
    sellersOrders: sellerOrderIds.map(orderId => ({ order: orderId })), // Store references
  }).save();

  await SellersOrder.updateMany(
    { _id: { $in: sellerOrderIds } },
    { status: "delivered" }
  );

  return order;
}


  
