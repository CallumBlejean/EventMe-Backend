const { fetchAllUsers, fetchUserById, fetchUserByEmail, insertUser, removeUserByEmail, changeUserById, removeUserById, restrictUser, updateUserStatusInDb } = require("../models/users.model")

exports.getAllUsers = (req, res, next) => {
    fetchAllUsers()
    .then((users) => {
        res.status(200).send({ users })
    })
    .catch(next)
}

exports.getUserById = (req, res, next) => {
    const { user_id } = req.params
    fetchUserById(user_id)
    .then((user) => {
        res.status(200).send({ user })
    })
    .catch(next)
}

exports.getUserByEmail = (req, res, next) => {
    const { email } = req.params
    fetchUserByEmail(email)
    .then((user) => {
        res.status(200).send({ user })
    })
   .catch(next)
}

exports.createUser = (req, res, next) => {
    const { firebase_uid, name, email, user_status = "active" } = req.body;
    insertUser(firebase_uid, name, email, user_status)
      .then((user) => {
        res.status(201).send({ user });
      })
      .catch(next);
  };
exports.deleteUserById = (req, res, next) => {
    const { user_id } = req.params;

    removeUserById(user_id)
        .then(() => res.status(204).send()) 
        .catch(next);
};

exports.updateUser = (req, res, next) => {
    const { user_id } = req.params;
    const { name, email, user_status } = req.body;
    changeUserById(user_id, name, email, user_status)
      .then((user) => {
        res.status(200).send({ user });
      })
      .catch(next);
  };

  exports.banUser = (req, res, next) => {
    const { user_id } = req.params;
  
    restrictUser(user_id)
      .then(({ user }) => {
        res.status(200).send({ user });
      })
      .catch(next);
  };
  
  
  exports.updateUserStatus = (req, res, next) => {
    const { user_id } = req.params;
    const { user_status } = req.body;
  
    if (!["active", "staff", "admin", "banned"].includes(user_status)) {
      return res.status(400).json({ msg: "Invalid user status" });
    }
  
    updateUserStatusInDb(user_id, user_status)
      .then((updatedUser) => {
        res.status(200).send({ user: updatedUser });
      })
      .catch(next);
  };