const express = require("express");
const { verifyToken } = require('../middleware/auth');
const { getAllUsers, getUserById, createUser, updateUser, deleteUserById, banUser, getUserByEmail, updateUserStatus } = require("../controllers/users.controller");

const usersRouter = express.Router();

usersRouter.get("/", verifyToken, getAllUsers);
usersRouter.get("/:user_id", verifyToken, getUserById);
usersRouter.get("/email/:email", verifyToken, getUserByEmail)
usersRouter.post("/", createUser);
usersRouter.delete("/:user_id", verifyToken, deleteUserById);
usersRouter.patch("/:user_id", verifyToken, updateUser);
usersRouter.patch("/restrict/:user_id", verifyToken, banUser);
usersRouter.patch("/:user_id/status", verifyToken, updateUserStatus);



module.exports = usersRouter;