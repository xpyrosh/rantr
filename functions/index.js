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

// @desc Fetch all posts
// @route GET /posts
// @access Public
app.get("/posts", (req, res) => {
    // doc.data is the individual entries
    admin
        .firestore()
        .collection("posts")
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

    admin
        .firestore()
        .collection("posts")
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

// To make our routes /api
// ie. https://website.com/api/ROUTE
exports.api = functions.https.onRequest(app);
