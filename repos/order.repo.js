const Branch = require("../models/branch.model");
const Product = require("../models/product.model");
const { AppError } = require("../utils/errorHandler");
const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const User = require("../models/base.model");

// ✅ Function to check if a product exists in "Website Branch" and return details
module.exports.addProductToOrder = async (productId) => {
  try {
    // Fetch the "Website Branch"
    const websiteBranch = await Branch.findOne({ name: "Website Branch" });
    if (!websiteBranch) {
      throw new AppError("Website Branch not found", 404);
    }

    // Check if the product exists in the "Website Branch" stock
    const productInBranch = websiteBranch.stock.find(
      (item) => item.productId.toString() === productId
    );

    if (!productInBranch) {
      throw new AppError("Product not found in Website Branch stock", 404);
    }

    // ✅ Fetch product details (including categoryName & images)
    const product = await Product.findById(productId)
      .select("name categoryName images")
      .lean(); // Convert to plain JavaScript object

    if (!product) {
      throw new AppError("Product details not found", 404);
    }



    // ✅ Return product details along with quantity in stock
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







// ✅ Create Online Order
module.exports.createOnlineOrder = async (userId, addressIndex, paymentMethod, customerNotes) => {
    try {
        // Fetch the user's cart
        const cart = await Cart.findOne({ userId }).populate("products.productId");

        if (!cart || cart.products.length === 0) {
            throw new AppError("Cart is empty", 400);
        }

        // Fetch the "Website Branch"
        const websiteBranch = await Branch.findOne({ name: "Website Branch" });
        if (!websiteBranch) {
            throw new AppError("Website Branch not found", 404);
        }

        // Fetch user details (for address)
        const user = await User.findById(userId).select("addresses phone1");
        if (!user || !user.addresses || addressIndex >= user.addresses.length) {
            throw new AppError("Invalid address index", 400);
        }

        const address = user.addresses[addressIndex];
        const phone = user.phone1;

        const changes = [];
        const validProducts = [];
        let totalPrice = 0;
        let totalQty = 0;

        for (const item of cart.products) {
            const productInBranch = websiteBranch.stock.find(
                (stockItem) => stockItem.productId.toString() === item.productId._id.toString()
            );

            if (!productInBranch) {
                changes.push({ productId: item.productId._id, status: "Product not available in Website Branch" });
                continue;
            }

            if (productInBranch.quantity < item.quantity) {
                changes.push({ productId: item.productId._id, status: `Only ${productInBranch.quantity} available` });
                continue;
            }

            validProducts.push({
                productId: item.productId._id,
                productName: item.productId.name,
                price: item.productId.soldPrice,
                requiredQty: item.quantity,
                totalPrice: item.productId.soldPrice * item.quantity,
                productImages: item.productId.images,
            });

            totalPrice += item.productId.soldPrice * item.quantity;
            totalQty += item.quantity;
        }

        if (changes.length > 0) {
            return { success: false, message: "Some products have stock issues", changes };
        }

        for (const item of validProducts) {
            const productInBranch = websiteBranch.stock.find(
                (stockItem) => stockItem.productId.toString() === item.productId.toString()
            );
            productInBranch.quantity -= item.requiredQty;
        }
        await websiteBranch.save();

        const order = new Order({
            customerId: userId,
            branchId: websiteBranch._id,
            orderType: "online",
            paymentMethod,
            customerNotes,
            address,
            phone,
            products: validProducts,
            totalPrice,
            totalQty,
        });

        await order.save();

        return { success: true, order };
    } catch (error) {
        throw new AppError(`Error creating online order: ${error.message}`, 500);
    }
};

// ✅ Create Offline Order
module.exports.createOfflineOrder = async (cashierId, customerName, phone, paymentMethod, products) => {
    try {
        // ✅ Fetch the branch of the cashier
        const cashier = await User.findById(cashierId).select("branchId");
        if (!cashier || !cashier.branchId) {
            throw new AppError("Cashier does not have a branch assigned", 400);
        }

        const branch = await Branch.findById(cashier.branchId);
        if (!branch) {
            throw new AppError("Branch not found", 404);
        }

        const changes = [];
        const validProducts = [];
        let totalPrice = 0;
        let totalQty = 0;

        for (const item of products) {
            const productInBranch = branch.stock.find(
                (stockItem) => stockItem.productId.toString() === item.productId
            );

            if (!productInBranch) {
                changes.push({ productId: item.productId, status: "Product not available in branch stock" });
                continue;
            }

            if (productInBranch.quantity < item.requiredQty) {
                changes.push({ productId: item.productId, status: `Only ${productInBranch.quantity} available` });
                continue;
            }

            const product = await Product.findById(item.productId).select("name soldPrice images");

            if (!product) {
                changes.push({ productId: item.productId, status: "Product details not found" });
                continue;
            }

            validProducts.push({
                productId: product._id,
                productName: product.name,
                price: product.soldPrice,
                requiredQty: item.requiredQty,
                totalPrice: product.soldPrice * item.requiredQty,
                productImages: product.images,
            });

            totalPrice += product.soldPrice * item.quantity;
            totalQty += item.requiredQty;
        }

        if (changes.length > 0) {
            return { success: false, message: "Some products have stock issues", changes };
        }

        // ✅ Deduct stock from branch
        for (const item of validProducts) {
            const productInBranch = branch.stock.find(
                (stockItem) => stockItem.productId.toString() === item.productId.toString()
            );
            productInBranch.quantity -= item.requiredQty;
        }
        await branch.save();

        // ✅ Create Offline Order (NEW: Ensure `customerName` is saved)
        const order = new Order({
            cashierId,
            branchId: branch._id,
            orderType: "offline", // ✅ Automatically set orderType
            paymentMethod,
            phone,
            customerName, // ✅ Save customer name properly
            products: validProducts,
            totalPrice,
            totalQty,
        });

        await order.save();

        return { success: true, order };
    } catch (error) {
        throw new AppError(`Error creating offline order: ${error.message}`, 500);
    }
};

  

