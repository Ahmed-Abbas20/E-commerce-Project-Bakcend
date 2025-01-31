const { loginUser, registerUser } = require("../services/auth.service");

const router = require("express").Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password ,profilePicture,user_id,first_name,last_name } = req.body;
    const { token } = await registerUser({
      email,
      password,
      username,
      profilePicture,
      user_id,
      first_name,
      last_name,
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
