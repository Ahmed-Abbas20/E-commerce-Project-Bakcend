const mongoose = require("mongoose");
const Permission = require("../models/permission.model");  

const uniquePermissions = [
    // Super Admin Permissions
    {
      effect: "allow",
      resource: "managers",
      action: ["create", "read", "update", "delete"],
      description: "Allows super admin to manage managers",
      condition: {
        role: {
          IN: ["super_admin", "manager"] 
        }
      }
    },
    {
      effect: "allow",
      resource: "cashiers",
      action: ["create", "read", "update", "delete"],
      description: "Allows super admin to manage cashiers",
      condition: {
        role: {
          IN: ["super_admin", "manager"] 
        }
      }
    },
    {
      effect: "allow",
      resource: "customers",
      action: ["create", "read", "update", "delete"],
      description: "Allows super admin to manage customers",
      condition: {
        role: {
          IN: ["super_admin", "manager"] 
        }
      }
    },
    {
      effect: "allow",
      resource: "products",
      action: ["create", "read", "update", "delete"],
      description: "Allows super admin to manage products",
      condition: {
        role: {
          IN: ["super_admin", "manager"] 
        }
      }
    },
    {
      "effect": "allow",
      "resource": "sellers",
      "action": ["create", "read", "update", "delete"],
      "description": "Allows super admin and manager to manage sellers, and sellers to update their own profile",
      "condition": {
        "$or": [
          { "role": { "IN": ["super_admin", "manager"] } },
          { "requester.id": "params.sellerId" }
        ]
      }
    }
    
    
    
,    
    
    
    {
      effect: "allow",
      resource: "suppliers",
      action: ["create", "read", "update", "delete"],
      description: "Allows super admin to manage suppliers",
      condition: {
        role: {
          IN: ["super_admin", "manager"] 
        }
      }
    },
    {
      effect: "allow",
      resource: "seller_inventory",
      action: ["create", "read", "update", "delete"],
      description: "Allows super admin to manage seller inventories",
      condition: {
        role: {
          IN: ["super_admin", "manager"] 
        }
      }
    },
    {
      effect: "allow",
      resource: "supplier_inventory",
      action: ["create", "read", "update", "delete"],
      description: "Allows super admin to manage supplier inventories",
      condition: {
        role: {
          IN: ["super_admin", "manager"] 
        }
      }
    },
    {
      effect: "allow",
      resource: "cus_orders",
      action: ["create", "read", "update", "delete"],
      description: "Allows super admin to manage customer orders",
      condition: {
        role: {
          IN: ["super_admin", "manager"] 
        }
      }
    },
    {
      effect: "allow",
      resource: "supplier_orders",
      action: ["create", "read", "update", "delete"],
      description: "Allows super admin to manage supplier orders",
      condition: {
        role: {
          IN: ["super_admin", "manager"] 
        }
      }
    },
    {
      effect: "allow",
      resource: "category",
      action: ["create", "read", "update", "delete"],
      description: "Allows super admin to manage product categories",
      condition: {
        role: {
          IN: ["super_admin", "manager"] 
        }
      }
    },
  
    // Clerk Permissions
    {
      effect: "allow",
      resource: "products",
      action: ["read"],
      description: "Allows clerk to read products",
      condition: {
        role: {
          IN: ["clerk", "manager"]
        }
      }
    },
    {
      effect: "allow",
      resource: "cus_orders",
      action: ["read", "update"],
      description: "Allows clerk to read and update customer orders",
      condition: {
        role: {
          IN: ["clerk", "manager"]
        }
      }
    },
  
    // Cashier Permissions
    {
      effect: "allow",
      resource: "cus_orders",
      action: ["read", "update"],
      description: "Allows cashier to read and update customer orders",
      condition: {
        role: {
          IN: ["cashier"]
        }
      }
    },
  
    // Seller Permissions
    {
      effect: "allow",
      resource: "products",
      action: ["create", "read", "update", "delete"], 
      description: "Allows seller to manage his own products",
      condition: {
        role: {
          IN: ["seller"]
        }
      }
    },
    {
      effect: "deny",
      resource: "products",
      action: ["create", "update", "delete"],
      description: "Restricts seller from managing other sellers' products",
      condition: {
        role: {
          IN: ["seller"]
        }
      }
    },
    {
      effect: "allow",
      resource: "category",
      action: ["read"],
      description: "Allows seller to read product categories",
      condition: {
        role: {
          IN: ["seller", "manager"]
        }
      }
    },
    {
      effect: "allow",
      resource: "cus_orders",
      action: ["read", "delete"],
      description: "Allows seller to read and delete their customer orders",
      condition: {
        role: {
          IN: ["seller"]
        }
      }
    },
    {
      effect: "allow",
      resource: "supplier_orders",
      action: ["read"],
      description: "Allows seller to read supplier orders",
      condition: {
        role: {
          IN: ["seller"]
        }
      }
    },
  
    // Customer Permissions
    {
      effect: "allow",
      resource: "products",
      action: ["read"],
      description: "Allows customer to read products",
      condition: {
        role: {
          IN: ["customer", "seller"]
        }
      }
    },
    {
      effect: "allow",
      resource: "cus_orders",
      action: ["read"],
      description: "Allows customer to read their orders",
      condition: {
        role: {
          IN: ["customer", "seller"]
        }
      }
    },
    {
      effect: "allow",
      resource: "category",
      action: ["read"],
      description: "Allows customer to read product categories",
      condition: {
        role: {
          IN: ["customer", "seller"]
        }
      }
    },
    {
      effect: "allow",
      resource: "clerk",
      action: ["create", "read", "update", "delete"],
      description: "Allows super admin to manage staff",
      condition: {
        role: {
          IN: ["super_admin", "manager"]

        }
      }
    },
    {
      effect: "allow",
      resource: "cashier",
      action: ["create", "read", "update", "delete"],
      description: "Allows super admin to manage staff",
      condition: {
        role: {
          IN: ["super_admin", "manager"]
        }
      }
    },
    {
      effect: "allow",
      resource: "manager",
      action: ["create", "read", "update", "delete"],
      description: "Allows super admin to manage staff",
      condition: {
        role: {
          IN: ["super_admin"]


        }
      }
    },
    {
      effect: "allow",
      resource: "cart",
      action: ["create", "read", "update", "delete"],
      description: "Allows customers to manage their cart",
      condition: {
        role: {
          IN: ["customer","seller"],
        },
      },
    },
  ];
  
  
  

// Function to seed permissions
async function seedPermissions() {
    try {
      const permissionExists = await Permission.countDocuments();  
  
      if (permissionExists > 0) {
        console.log("Permissions already seeded, skipping...");
        return;  
      }
  
      
      await Permission.insertMany(uniquePermissions);
  
      console.log("Permissions successfully seeded!");
    } catch (error) {
      console.error("Error seeding permissions:", error);
    }
  }
  
  module.exports = seedPermissions;