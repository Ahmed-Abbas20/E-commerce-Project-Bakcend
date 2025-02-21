const { loginUser, registerUser, softDeleteUser } = require("../services/auth.service");
const router = require("express").Router();
const { validateUserRegistration } = require("../middlewares/RegisterValidation.middleware");

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

    const user = await softDeleteUser(userId);

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token } = await loginUser({ email, password });
    res.status(200).json({ success: true, token });
  } catch (error) {
    next(error);
  }
});
module.exports = router;