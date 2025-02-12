const mongoose = require("mongoose");
const Permission = require("../models/permission.model");  

const uniquePermissions = [
    // Super Admin Restrictions
    {
      effect: "deny",
      resource: "super_admin",
      action: ["create", "read", "update", "delete"],
      description: "Prevents anyone from making CRUD operations on super_admin",
      condition: {}
    },
    
    // Super Admin Permissions (excluding super_admin CRUD)
    {
      effect: "allow",
      resource: "managers",
      action: ["create", "read", "update", "delete"],
      description: "Allows super admin to manage managers",
      condition: {
        role: {
          IN: ["super_admin"] 
        }
      }
    },
    {
      effect: "allow",
      resource: "clerks",
      action: ["create", "read", "update", "delete"],
      description: "Allows super admin and managers to manage clerks",
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
      description: "Allows super admin and managers to manage cashiers",
      condition: {
        role: {
          IN: ["super_admin", "manager"] 
        }
      }
    },
    {
      effect: "allow",
      resource: "sellers",
      action: ["create", "read", "update", "delete"],
      description: "Allows super admin and managers to manage sellers",
      condition: {
        role: {
          IN: ["super_admin", "manager"] 
        }
      }
    },
    {
      effect: "deny",
      resource: "managers",
      action: ["update"],
      description: "Prevents managers from updating other managers or super admins",
      condition: {
        role: {
          IN: ["manager"]
        }
      }
    },
    
    // Product Management
    {
      effect: "allow",
      resource: "products",
      action: ["create", "read", "update", "delete"],
      description: "Allows super admin and managers to manage products",
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
      description: "Allows clerks to read products",
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
      description: "Allows clerks to read and update customer orders",
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
      description: "Allows cashiers to read and update customer orders",
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
      description: "Allows sellers to manage their own products",
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
      description: "Restricts sellers from managing other sellers' products",
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
      description: "Allows sellers to read product categories",
      condition: {
        role: {
          IN: ["seller", "manager"]
        }
      }
    },
    
    // Customer Permissions
    {
      effect: "allow",
      resource: "products",
      action: ["read"],
      description: "Allows customers to read products",
      condition: {
        role: {
          IN: ["customer"]
        }
      }
    },
    {
      effect: "allow",
      resource: "cus_orders",
      action: ["read"],
      description: "Allows customers to read their orders",
      condition: {
        role: {
          IN: ["customer"]
        }
      }
    },
    {
      effect: "allow",
      resource: "category",
      action: ["read"],
      description: "Allows customers to read product categories",
      condition: {
        role: {
          IN: ["customer"]
        }
      }
    },

    // Self-Update Permissions
    { effect: "allow", resource: "clerks", action: ["read", "update"], description: "Allows clerks to read and update their own profile", condition: { role: { IN: ["clerk"] }, self: true } },
    { effect: "allow", resource: "managers", action: ["read", "update"], description: "Allows managers to read and update their own profile", condition: { role: { IN: ["manager"] }, self: true } },
    { effect: "allow", resource: "cashiers", action: ["read", "update"], description: "Allows cashiers to read and update their own profile", condition: { role: { IN: ["cashier"] }, self: true } },
    { effect: "allow", resource: "sellers", action: ["read", "update"], description: "Allows sellers to read and update their own profile", condition: { role: { IN: ["seller"] }, self: true } },
    { effect: "allow", resource: "customers", action: ["read", "update"], description: "Allows customers to read and update their own profile", condition: { role: { IN: ["customer"] }, self: true } }

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
