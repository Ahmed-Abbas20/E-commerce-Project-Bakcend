const User = require("../models/base.model");
const bcrypt = require("bcrypt");

module.exports.getUsers = async () => {
    try {
        const users = await User.find({});
        return users;
    } catch (error) {
        console.error(error);
        throw new Error("Error fetching users");
    }
};

module.exports.updateUsers = async (userId, updatedData) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });
        return updatedUser;
    } catch (error) {
        console.error(error);
        throw new Error("Error updating user");
    }
};

module.exports.createUsers =  async ({ phone1, email, password ,first_name,last_name}) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedpassword = await bcrypt.hash(password, salt);
      const user = new User({
          first_name,
          last_name,
          email,
          phone1,
        password: hashedpassword,
        salt,
        user_type: "Customer",
      });
      await user.save();
      const claims = {
        sub: user.user_id,
        username: user.username,
        email: user.email,
        userType: user.user_type,
      };
      return claims;
    } catch (error) {
      throw new Error("Error creating user: " + error.message);
    }
  };

  module.exports.getUserByEmail = async ({ email }) => {
    try {
      const user = await User.findOne({
        email,
      });
  
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw new Error("Error fetching user: " + error.message);
    }
  };
module.exports.deleteUsers = async (userId) => {
    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        return deletedUser;
    } catch (error) {
        console.error(error);
        throw new Error("Error deleting user");
    }
};
