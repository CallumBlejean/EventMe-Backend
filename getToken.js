require('dotenv').config({ path: '.env.development' });


const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithCustomToken } = require('firebase/auth');

// Load Firebase Admin with your service account
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Firebase Client SDK config
const firebaseClientConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

const clientApp = initializeApp(firebaseClientConfig);
const clientAuth = getAuth(clientApp);

// Simulate a user
const testUid = 'test-user-123';

admin
  .auth()
  .createCustomToken(testUid)
  .then((customToken) => {
    return signInWithCustomToken(clientAuth, customToken);
  })
  .then((userCredential) => {
    return userCredential.user.getIdToken();
  })
  .then((idToken) => {
    console.log('\n🎟️ Firebase ID Token:\n');
    console.log(idToken);
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
  });
