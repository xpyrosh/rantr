const functions = require("firebase-functions");

// for access to the database
const admin = require("firebase-admin");

// .firebaserc already knows which project so we don't need to pass one
admin.initializeApp();

// npm i express
// Init Express
const express = require("express");
const app = express();

// npm i firebase
// Init Firebase
const firebase = require("firebase");

// firebase config object
const firebaseConfig = {
    apiKey: "AIzaSyA2Fbit1pc6UFaouoI4Pz8HFJVJ3d3SStI",
    authDomain: "rantr-4a4fa.firebaseapp.com",
    projectId: "rantr-4a4fa",
    storageBucket: "rantr-4a4fa.appspot.com",
    messagingSenderId: "604693866383",
    appId: "1:604693866383:web:1ac39bf49a62970289cdfa",
    measurementId: "G-0GBXXJMBFQ",
};

firebase.initializeApp(firebaseConfig);

// so we can replace admin.firestore() with db
const db = admin.firestore();

// @desc Fetch all posts
// @route GET /posts
// @access Public
app.get("/posts", (req, res) => {
    // doc.data is the individual entries
    db.collection("posts")
        .orderBy("createdAt", "desc")
        .get()
        .then((data) => {
            let posts = [];
            data.forEach((doc) => {
                posts.push({
                    postId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt,
                });
            });
            return res.json(posts);
        })
        .catch((err) => console.error(err));
});

// @desc Create new Post
// @route POST /posts
// @access Public
app.post("/posts", (req, res) => {
    const newPost = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString(),
    };

    db.collection("posts")
        .add(newPost)
        .then((doc) => {
            res.json({
                message: `document ${doc.id} created successfully.`,
            });
        })
        .catch((err) => {
            // return 500 server error
            res.status(500).json({ error: "There was an error" });
            console.error(err);
        });
});

// @desc Sign up new user
// @route POST /signup
// @access Public
app.post("/signup", (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    // VALIDATE DATA
    db.doc(`/users/${newUser.handle}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                return res
                    .status(400)
                    .json({ handle: "This user already exists." });
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(
                        newUser.email,
                        newUser.password
                    );
            }
        })
        .then((data) => {
            return data.user.getIdToken();
        })
        .then((token) => {
            return res.status(201).json({ token });
        })
        .catch((err) => {
            console.error(err);
            if (err.code === "auth/email-already-in-use") {
                return res.status(400).json({ email: "Email already in use." });
            } else {
                return res.status(500).json({ error: err.code });
            }
        });
});

// To make our routes /api
// ie. https://website.com/api/ROUTE
exports.api = functions.https.onRequest(app);
