const { loginCustomer, registerCustomer } = require("../services/auth.service");
const router = require("express").Router();
const {AppError} = require("../utils/errorHandler"); // Import the AppError class
const { validateUserRegistration } = require("../middlewares/RegisterValidation.middleware");

// Register Route
router.post("/register",validateUserRegistration, async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone1, userType = "customer", role } = req.body;
    
    // Validate role for staff members
    if (userType === "staff" && !role) {
      // Use AppError for custom error
      return next(new AppError("Role is required for staff members", 400));
    }
    
    const { token } = await registerCustomer({
      firstName,
      lastName,
      email,
      password,
      phone1,
      userType,
      role,
    });

    res.status(201).json({ success: true, token });
  } catch (error) {
    next(error); // Pass the error to the errorHandler middleware
  }
});

// Login Route
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token } = await loginCustomer({
      email,
      password,
    });
    res.status(200).json({ token });
  } catch (error) {
    next(error); // Pass the error to the errorHandler middleware
  }
});

module.exports = router;
