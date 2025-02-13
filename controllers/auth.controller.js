const { loginUser } = require("../services/auth.service");
const router = require("express").Router();
const { validateUserRegistration } = require("../middlewares/RegisterValidation.middleware");
const { registerUser }= require("../services/auth.service");
const { softDeleteUser } = require("../services/auth.service");

// Register Route
router.post("/register", validateUserRegistration, async (req, res, next) => {
  try {
    const { token } = await registerUser(req.body);
    res.status(201).json({ success: true, token });
  } catch (error) {
    next(error);
  }
});



router.delete("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Call the softDeleteUser function
    const user = await softDeleteUser(userId);

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// Login Route
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token } = await loginUser({
      email,
      password,
    });
    res.status(200).json({ token });
  } catch (error) {
    next(error); // Pass the error to the errorHandler middleware
  }
});

module.exports = router;
