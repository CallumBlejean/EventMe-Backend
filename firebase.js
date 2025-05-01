const admin = require('firebase-admin');
const dotenv = require("dotenv");


const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFile });

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT is missing from environment variables!");
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (error) {
  console.error("Invalid FIREBASE_SERVICE_ACCOUNT JSON", error);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
