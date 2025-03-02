const mongoose = require("mongoose");
const Permission = require("../models/permission.model");
const User = require("../models/base.model");
const bcrypt = require("bcrypt");

// Define permissions
const newPermissions = [
  // Branch Permissions
  {
    effect: "allow",
    resource: "branch",
    action: [
      "create", "getAll", "getBranchById", "updateById", "deleteById",
      "filterProductsByBranchId", "searchProductsByBranchId",
      "addProductToBranchId", "removeProductFromBranchId", "getProductsByBranchId"
    ],
    description: "Super Admin permissions for managing branches and products by branch.",
    condition: { role: { IN: ["super_admin"] } }
  },
  {
    effect: "allow",
    resource: "branch",
    action: ["getMyBranchProducts"], 
    description: "Super Admin and Manager can access their own branch products.",
    condition: { role: { IN: ["super_admin", "manager"] } }
  },


  // Cashier Permissions
  {
    effect: "allow",
    resource: "cashier",
    action: ["create", "getById", "updateById", "deleteById","getAllByMyBranch"],
    description: "Super Admin and Managers can create and manage cashiers in their branch.",
    condition: { role: { IN: ["super_admin", "manager"] } }
  }
  ,
  {
    effect: "allow",
    resource: "cashier",
    action: ["getAll"],
    description: "Super Admin can get all cashiers.",
    condition: { role: { IN: ["super_admin"] } }
  }
  ,

  // Category Permissions
  {
    effect: "allow",
    resource: "category",
    action: ["create", "updateById", "deleteById"],
    description: "Super Admin manages categories.",
    condition: { role: { IN: ["super_admin"] } }
  },

  // Customer Permissions - Super Admin Only
  {
    effect: "allow",
    resource: "customer",
    action: ["create", "getAll", "getById", "getAddressByCustomerId", "updateById", "addAddressByCustomerId","deleteById"],
    description: "Super Admin manages all customer-related actions.",
    condition: { role: { IN: ["super_admin"] } }
  },

  // Manager Permissions
  {
    effect: "allow",
    resource: "manager",
    action: ["create", "getAll", "getById", "updateById", "deleteById"],
    description: "Super Admin manages managers.",
    condition: { role: { IN: ["super_admin"] } }
  },

  // Order Permissions
  {
    effect: "allow",
    resource: "order",
    action: ["addProductOffline", "createOfflineOrder"],
    description: "Super Admin, Manager, and Cashier can add products and create offline orders.",
    condition: { role: { IN: ["super_admin", "manager", "cashier"] } }
  },
  {
    effect: "allow",
    resource: "order",
    action: ["getCustomerOrdersByCustomerId", "getSellerOrdersBySellerId","getAll","adminAddProduct","getBranchOrders"],
    description: "Super Admin manages customer and seller orders.",
    condition: { role: { IN: ["super_admin"] } }
  },

{
  effect: "allow",
  resource: "order",
  action: [
    "updateOrderById","getMyBranchOrders","cancelOrderById",
  ],
  description: "Super Admin and Manager can update and cancel orders.",
  condition: { role: { IN: ["super_admin", "manager"] } }
},

  // Product Permissions
  {
    effect: "allow",
    resource: "product",
    action: ["create", "deleteById", "updateById", "getAllMainStock","searchAllMainStock","filterAllMainStock",],
    description: "Super Admin manages all products in the main stock.",
    condition: { role: { IN: ["super_admin"] } }
  },
  {
    effect: "allow",
    resource: "product",
    action: ["getById"],
    description: "Super Admin and Managers can access products in their branch.",
    condition: { role: { IN: ["super_admin", "manager"] } }
  },

  // Seller Permissions - Super Admin Only
  {
    effect: "allow",
    resource: "seller",
    action: ["create", "getAll", "getById", "updateById", "getSellerAddressesBySellerId", "addAddressToSellerById","getSellersAnalysis","deleteById",],
    description: "Super Admin manages all seller-related actions.",
    condition: { role: { IN: ["super_admin"] } }
  },
  //Request Permissions
  {
    effect: "allow",
    resource: "request",
    action: ["create","getMyBranchProducts"],
    description: "Manager can create product requests.",
    condition: { role: { IN: ["super_admin","manager"] } },
  },
  {
    effect: "allow",
    resource: "request",
    action: ["approveFull","approvePartial", "reject","getAll", "getById"],
    description: "Admin can approve and manage product requests.",
    condition: { role: { IN: ["super_admin"] } },
  },
];

// Seed Permissions Function
async function seedPermissions() {
  try {
    await Permission.deleteMany({});
    await Permission.insertMany(newPermissions);
    console.log("Permissions successfully seeded!");
  } catch (error) {
    console.error("Error seeding permissions:", error);
  }
}

// Seed Super Admin Function
async function seedSuperAdmin() {
  try {
    const existingAdmin = await User.findOne({ role: "super_admin" });

    if (existingAdmin) {
      console.log("Super Admin already exists.");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, salt);

    const superAdmin = new User({
      firstName: "Super",
      lastName: "Admin",
      email: process.env.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      salt: salt,
      phone1: process.env.SUPER_ADMIN_PHONE,
      userType: "staff",
      role: "super_admin",
      branchId: new mongoose.Types.ObjectId(process.env.SUPER_ADMIN_BRANCH_ID),
      SSN: process.env.SUPER_ADMIN_SSN,
      isActive: true,
      addresses: [
        {
          city: process.env.SUPER_ADMIN_CITY,
          street: process.env.SUPER_ADMIN_STREET,
          gov: process.env.SUPER_ADMIN_GOV,
          zipCode: process.env.SUPER_ADMIN_ZIP,
        }
      ],
    });

    await superAdmin.save();
    console.log("Super Admin account created successfully with real production data.");
  } catch (error) {
    console.error("Error seeding Super Admin:", error);
  }
}

// Combined Seeding Function
async function seedData() {
  await seedPermissions();
  await seedSuperAdmin();
  console.log("Seeding process completed.");
}

// Export the combined seeding function
module.exports = seedData;
