const { loginUser, registerUser } = require("../services/auth.service");
const router = require("express").Router();



router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone1, userType = "Customer", role } = req.body;
    // Validate role for staff members
    if (userType === "Staff" && !role) {
      return res.status(400).json({ message: "Role is required for staff members" });
    }

    const { token } = await registerUser({
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
    res.status(500).json({ message: error.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token } = await loginUser({
      email,
      password,
    });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
