const { loginUser } = require("../services/auth.service");
const router = require("express").Router();
const { validateUserRegistration } = require("../middlewares/RegisterValidation.middleware");
const { registerUser }= require("../services/auth.service");

// Register Route
router.post("/register", validateUserRegistration, async (req, res, next) => {
  try {
    const { token } = await registerUser(req.body);
    res.status(201).json({ success: true, token });
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
