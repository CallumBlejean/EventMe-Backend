const format = require("pg-format");
const db = require("../connection");

const seed = ({ userData, eventData, eventMemberData }) => {
  return db
    .query(`DROP TABLE IF EXISTS event_members CASCADE;`)
    .then(() => db.query(`DROP TABLE IF EXISTS events CASCADE;`))
    .then(() => db.query(`DROP TABLE IF EXISTS users CASCADE;`))
    .then(() => {
      return db.query(`
        CREATE TABLE users (
      user_id SERIAL PRIMARY KEY,
      firebase_uid TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      user_status TEXT DEFAULT 'active' CHECK (user_status IN ('active', 'admin', 'staff', 'banned'))
);`);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE events (
        event_id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        location TEXT,
        created_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL
);`);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE event_members (
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        event_id INTEGER REFERENCES events(event_id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, event_id)
);`);
    })
    .then(() => {
      const insertUserQueryStr = format(
        "INSERT INTO users (firebase_uid, name, email, user_status) VALUES %L RETURNING *;",
        userData.map(({ firebase_uid, name, email, user_status = 'active' }) => [
          firebase_uid,
          name,
          email,
          user_status,
        ])
      );
        return db.query(insertUserQueryStr);
      })
      .then(({ rows: insertedUsers }) => {
        const userMap = {};
        insertedUsers.forEach((user) => {
          userMap[user.firebase_uid] = user.user_id;
        });
  
        const insertEventQueryStr = format(
          `INSERT INTO events (title, description, date, location, created_by) VALUES %L RETURNING *;`,
          eventData.map(({ title, description, date, location, created_by_firebase_uid }) => [
            title,
            description,
            date,
            location,
            userMap[created_by_firebase_uid] || null,
          ])
        );
  
        return db.query(insertEventQueryStr).then(({ rows }) => ({
          insertedUsers,
          insertedEvents: rows,
          userMap,
        }));
      })
      .then(({ insertedUsers, insertedEvents, userMap }) => {
        const eventMap = {};
        insertedEvents.forEach((event) => {
          eventMap[event.title] = event.event_id;
        });
  
        const insertMembersQueryStr = format(
          "INSERT INTO event_members (user_id, event_id) VALUES %L;",
          eventMemberData.map(({ firebase_uid, event_title }) => [
            userMap[firebase_uid],
            eventMap[event_title],
          ])
        );
  
        return db.query(insertMembersQueryStr);
      });
  };

module.exports = seed;
