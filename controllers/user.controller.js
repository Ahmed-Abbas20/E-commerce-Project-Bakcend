const { getUsers, createUser, updateUser, deleteUser } = require("../services/user.service");

module.exports = (() => {
    const router = require("express").Router();

    router.get("/users", async (req, res) => {
        try {
            const users = await getUsers();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // router.post("/users", async (req, res) => {
    //     try {
    //         const newUser = await createUser(req.body);
    //         res.status(201).json(newUser);
    //     } catch (error) {
    //         res.status(500).json({ error: error.message });
    //     }
    // });

    router.put("/users/:id", async (req, res) => {
        try {
            const updatedUser = await updateUser(req.params.id, req.body);
            if (!updatedUser) {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.delete("/users/:id", async (req, res) => {
        try {
            const deletedUser = await deleteUser(req.params.id);
            if (!deletedUser) {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(200).json({ message: "User deleted successfully", user: deletedUser });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
})();
