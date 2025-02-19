const Branch = require("../models/branch.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const User = require("../models/base.model");
const Staff = require("../models/staff.model");
const { AppError } = require("../utils/errorHandler");

// Check Product Availability in Branch
module.exports.addProductToOrder = async (userId, productId) => {
    try {
      
      const user = await Staff.findById(userId).select("branchId");
      if (!user || !user.branchId) throw new AppError("User's branch not found", 400);
  
      
      const branch = await Branch.findById(user.branchId);
      if (!branch) throw new AppError("Branch not found", 404);
  
      
      const productInBranch = branch.stock.find(item => item.productId.toString() === productId);
      if (!productInBranch) throw new AppError("Product not available in assigned branch stock", 404);
  
      
      const product = await Product.findById(productId).select("name categoryName images").lean();
      if (!product) throw new AppError("Product details not found", 404);
  
      return {
        productId: product._id,
        name: product.name,
        category: product.categoryName,
        quantityAvailable: productInBranch.quantity, 
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

    const { validProducts, totalPrice, totalQty, changes } = await processOrderItems(products, websiteBranch);
    if (changes.length > 0) return { success: false, message: "Some products have stock issues", changes };

    const order = await saveOnlineOrder(userId, websiteBranch._id, paymentMethod, customerNotes, address, phone, validProducts, totalPrice, totalQty);
    
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

    const { validProducts, totalPrice, totalQty, changes } = await processOrderItems(products, branch);
    if (changes.length > 0) return { success: false, message: "Some products have stock issues", changes };

    const order = await saveOfflineOrder(cashierId, branch._id, paymentMethod, phone, validProducts, totalPrice, totalQty, customerName);

    return { success: true, order };
  } catch (error) {
    throw new AppError(`Error creating offline order: ${error.message}`, 500);
  }
};

//  Process Products & Validate Stock
async function processOrderItems(products, branch) {
    const changes = [];
    const validProducts = [];
    let totalPrice = 0;
    let totalQty = 0;

    for (const item of products) {
        
        const productInBranch = branch.stock.find(stockItem => stockItem.productId.toString() === item.productId.toString());
        if (!productInBranch || productInBranch.quantity < item.requiredQty) {
            changes.push({ productId: item.productId, status: `Insufficient stock` });
            continue;
        }

      
        const product = await Product.findById(item.productId).select("name soldPrice images");
        if (!product) {
            changes.push({ productId: item.productId, status: "Product details not found" });
            continue;
        }

        const itemTotalPrice = product.soldPrice * item.requiredQty;
        validProducts.push({
            productId: product._id,
            productName: product.name,
            price: product.soldPrice,
            requiredQty: item.requiredQty, 
            totalPrice: itemTotalPrice,
            productImages: product.images,
        });

        totalPrice += itemTotalPrice;
        totalQty += item.requiredQty;
        productInBranch.quantity -= item.requiredQty;
    }

    await branch.save();
    return { validProducts, totalPrice, totalQty, changes };
}

  

// Save Online Order 
async function saveOnlineOrder(customerId, branchId, paymentMethod, customerNotes, address, phone, products, totalPrice, totalQty) {
  return await new Order({
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
  }).save();
}

// Save Offline Order 
async function saveOfflineOrder(cashierId, branchId, paymentMethod, phone, products, totalPrice, totalQty, customerName) {
  return await new Order({
    cashierId,
    branchId,
    orderType: "offline",
    paymentMethod,
    phone,
    customerName,
    products,
    totalPrice,
    totalQty,
  }).save();
}
