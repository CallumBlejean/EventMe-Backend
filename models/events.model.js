const db = require("../db/connection");

exports.fetchAllEvents = () => {
  return db.query("SELECT * FROM events;").then(({ rows }) => rows);
};

exports.fetchEventById = (event_id) => {
  return db
    .query("SELECT * FROM events WHERE event_id = $1", [event_id])
    .then(({ rows }) => {
      if (!rows.length) return Promise.reject({ status: 404, msg: "Event Not Found" });
      return rows[0];
    });
};

exports.insertEvent = (title, description, date, location, created_by) => {
  return db.query(
    `INSERT INTO events (title, description, date, location, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *;`,
    [title, description, date, location, created_by]
  )
  .then(({ rows }) => rows[0])
  .catch((err) => {
    console.error("🔥 insertEvent error:", err.message || err);
    throw err; 
  });
};

exports.deleteEventById = (event_id) => {
  return db.query("DELETE FROM events WHERE event_id = $1 RETURNING *;", [event_id])
    .then(({ rowCount }) => {
      if (!rowCount) return Promise.reject({ status: 404, msg: "Event Not Found" });
    });
};

exports.fetchEventMembers = (event_id) => {
  return db.query(
    `SELECT u.user_id, u.name, u.email
     FROM event_members em
     JOIN users u ON u.user_id = em.user_id
     WHERE em.event_id = $1;`,
    [event_id]
  ).then(({ rows }) => rows);
};

exports.addEventMember = (user_id, event_id) => {
  return db.query(
    `INSERT INTO event_members (user_id, event_id)
     VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *;`,
    [user_id, event_id]
  ).then(({ rowCount }) => {
    if (!rowCount) return Promise.reject({ status: 409, msg: "Already a member" });
  });
};

exports.removeEventMember = (user_id, event_id) => {
  return db
    .query(
      `DELETE FROM event_members WHERE user_id = $1 AND event_id = $2 RETURNING *;`,
      [user_id, event_id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Member not found in event" });
      }
    });
};

exports.checkIfMemberExists = (user_id, event_id) => {
  return db
    .query(
      `
      SELECT * FROM event_members 
      WHERE user_id = $1 AND event_id = $2;
      `,
      [user_id, event_id]
    )
    .then((result) => result.rows.length > 0);
};

exports.fetchUserStatusById = (user_id) => {
  return db
    .query(`SELECT user_status FROM users WHERE user_id = $1`, [user_id])
    .then(({ rows }) => {
      if (!rows.length) return null;
      return rows[0].user_status;
    });
};

exports.fetchEventsByUserId = (user_id) => {
  return db
    .query(
      `
      SELECT events.event_id, events.title, events.description, events.date, events.location
      FROM event_members
      JOIN events ON event_members.event_id = events.event_id
      WHERE event_members.user_id = $1;
      `,
      [user_id]
    )
    .then((result) => {
      return result.rows;
    });
};

