const db = require("../db/connection"); 
const admin = require('../firebase');

function verifyToken(req, res, next) {
  const idToken = req.headers.authorization?.split("Bearer ")[1];

  if (!idToken) {
    console.error("Missing token in request");
    return res.status(401).json({ msg: "Unauthorized - No Token Provided" });
  }

  admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => {
      const firebase_uid = decodedToken.uid;

      
      return db.query(
        "SELECT user_id, user_status FROM users WHERE firebase_uid = $1",
        [firebase_uid]
      ).then(({ rows }) => {
        if (!rows.length) {
          return Promise.reject({ status: 401, msg: "User not found in DB" });
        }

        const user = rows[0];

        req.user = {
          firebase_uid,
          email: decodedToken.email,
          user_id: user.user_id,
          user_status: user.user_status,
        };

        console.log("✅ Authenticated user:", req.user);
        next();
      });
    })
    .catch((err) => {
      if (err.status && err.msg) {
        res.status(err.status).json({ msg: err.msg });
      } else {
        console.error("Token Verification or DB Lookup Failed:", err);
        res.status(403).json({ msg: "Invalid or Expired Token or user not in DB" });
      }
    });
}


// producing too many side errors fix later.
// // Middleware to check if user is admin
// const checkAdmin = (req, res, next) => {
//   const firebase_uid = req.user?.firebase_uid;

//   if (!firebase_uid) {
//     return res.status(401).json({ msg: "Unauthorized - Missing Firebase UID" });
//   }

//   db.query("SELECT user_id, user_status FROM users WHERE firebase_uid = $1", [firebase_uid])
//     .then(({ rows }) => {
//       const user = rows[0];
//       if (!user) return res.status(404).json({ msg: "User not found" });

//       req.user.user_id = user.user_id;

//       if (user.user_status === "admin") {
//         console.log("✅ Admin check passed!");
//         return next();
//       }

//       return res.status(403).json({ msg: "Forbidden - Admin access required" });
//     })
//     .catch(() => {
//       res.status(500).json({ msg: "Internal Server Error" });
//     });
// };

// // Middleware to check if user is staff or admin
// const checkStaff = (req, res, next) => {
//   const firebase_uid = req.user?.firebase_uid;

//   if (!firebase_uid) {
//     return res.status(401).json({ msg: "Unauthorized - Missing Firebase UID" });
//   }

//   db.query("SELECT user_id, user_status FROM users WHERE firebase_uid = $1", [firebase_uid])
//     .then(({ rows }) => {
//       const user = rows[0];
//       if (!user) return res.status(404).json({ msg: "User not found" });

//       req.user.user_id = user.user_id; // Always attach user_id no matter what!

//       if (user.user_status === "admin" || user.user_status === "staff") {
//         console.log("✅ Staff/Admin check passed");
//         return next();
//       }

//       console.log("❌ Forbidden - Not Staff/Admin");
//       return res.status(403).json({ msg: "Forbidden - Staff or Admin required" });
//     })
//     .catch((err) => {
//       console.error("🔥 Error in checkStaff:", err.message);
//       console.log("🔥 Error in checkStaff:", err.message);
//       res.status(500).json({ msg: "Internal Server Error in checkstaff function" });
//     });
// };


module.exports = { verifyToken };