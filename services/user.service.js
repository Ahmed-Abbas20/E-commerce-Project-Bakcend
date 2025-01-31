const { getUsers, createUsers, updateUsers, deleteUsers,getUserByEmail } = require("../repos/user.repo");

module.exports.getUsers = async () => {
    return await getUsers();
};

module.exports.createUser = async (userData) => {
    return await createUsers(userData);
};

module.exports.updateUser = async (userId, updatedData) => {
    return await updateUsers(userId, updatedData);
};

module.exports.deleteUser = async (userId) => {
    return await deleteUsers(userId);
};
module.exports.getUserByEmail = async (userId) => {
    return await getUserByEmail(userId);
};
