// for access to the database
const admin = require("firebase-admin");

// .firebaserc already knows which project so we don't need to pass one
admin.initializeApp();

// so we can replace admin.firestore() with db
const db = admin.firestore();

module.exports = { admin, db };
