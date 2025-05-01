const db = require("../db/connection");

exports.fetchAllUsers = () => {
  return db
    .query(
      `
        SELECT * FROM users
        `
    )
    .then((result) => {
      return result.rows;
    });
};

exports.fetchUserById = (user_id) => {
  return db
    .query(
      `
        SELECT * FROM users WHERE user_id = $1
        `,
      [user_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "User Not Found" });
      }
      return result.rows[0];
    });
};

exports.fetchUserByEmail = (email) => {
  return db
    .query(`SELECT * FROM users WHERE email = $1`, [email])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "User Not Found" });
      }
      return result.rows[0];
    });
};

exports.insertUser = (firebase_uid, name, email, user_status = "active") => {
    return db.query(
      `INSERT INTO users (firebase_uid, name, email, user_status)
       VALUES ($1, $2, $3, $4)
       RETURNING *;`,
      [firebase_uid, name, email, user_status]
    ).then(({ rows }) => rows[0]);
  };

exports.removeUserById = (user_id) => {
  return db
    .query("DELETE FROM users WHERE user_id = $1 RETURNING *;", [user_id])
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({ status: 404, msg: "User not found" });
      }
    });
};

exports.changeUserById = (user_id, name, email, user_status) => {
    const validStatus = ["active", "admin", "staff", "banned"];

    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof user_status !== "string" ||
        !validStatus.includes(user_status)
      ) {
        return Promise.reject({ status: 400, msg: "Bad Request - Invalid Data" });
      }

  return db
    .query(
      `
        UPDATE users
        SET name = $1,
            email = $2,
            user_status = $3
        WHERE user_id = $4
        RETURNING *;
      `,
      [name, email, user_status, user_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "User Not Found" });
      }
      return result.rows[0];
    });
};

exports.restrictUser = (user_id) => {
  if (!user_id) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request - Missing user ID",
    });
  }

  return db
    .query(
      `
      UPDATE users
      SET user_status = 'banned'
      WHERE user_id = $1
      RETURNING *;
    `,
      [user_id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "404: User Not Found" });
      }
      return { user: rows[0] };
    });
};

exports.updateUserStatusInDb = (user_id, user_status) => {
  return db.query(
    `UPDATE users SET user_status = $1 WHERE user_id = $2 RETURNING *;`,
    [user_status, user_id]
  )
  .then(({ rows }) => {
    if (!rows.length) {
      return Promise.reject({ status: 404, msg: "User not found" });
    }
    return rows[0];
  });
};
