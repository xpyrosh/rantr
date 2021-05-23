const functions = require("firebase-functions");

// for access to the database
const admin = require("firebase-admin");

// .firebaserc already knows which project so we don't need to pass one
admin.initializeApp();

// initialize Express
const express = require("express");
const app = express();

// @desc Fetch all posts
// @route GET /posts
// @access Public
app.get("/posts", (req, res) => {
    // doc.data is the individual entries
    admin
        .firestore()
        .collection("posts")
        .get()
        .then((data) => {
            let posts = [];
            data.forEach((doc) => {
                posts.push(doc.data());
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
        createdAt: admin.firestore.Timestamp.fromDate(new Date()),
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
