const functions = require("firebase-functions");

// npm i express
// Init Express
const express = require("express");
const app = express();

// Import utilies
const FBAuth = require("./util/fbAuth");

// import db
const { db } = require("./util/admin");

// Import handlers
const {
    getAllPosts,
    newPost,
    getPost,
    commentOnPost,
    likePost,
    unlikePost,
    deletePost,
} = require("./handlers/posts");
const {
    signUp,
    logIn,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser,
} = require("./handlers/users");

//* */ POST ROUTES/* *//

// @desc Fetch all posts
// @route GET /posts
// @access Public
app.get("/posts", getAllPosts);

// @desc Create new Post
// @route POST /posts
// @access Protected
app.post("/post", FBAuth, newPost);

// @desc Get single post
// @route GET /post/:postId
// @access Public
app.get("/post/:postId", getPost);

// @desc Delete a post
// @route DELETE /post/:postId
// @access Protected
app.delete("/post/:postId", FBAuth, deletePost);

// @desc Like a post
// @route GET /post/:postId/like
// @access Protected
app.get("/post/:postId/like", FBAuth, likePost);

// @desc Unlike a post
// @route GET /post/:postId/unlike
// @access Protected
app.get("/post/:postId/unlike", FBAuth, unlikePost);

// @desc Comment on a post
// @route POST /post/:postId/comment
// @access Protected
app.post("/post/:postId/comment", FBAuth, commentOnPost);

//* */ USER ROUTES /* *//

// @desc Sign up new user
// @route POST /signup
// @access Public
app.post("/signup", signUp);

// @desc Login user
// @route POST /login
// @access Public
app.post("/login", logIn);

// @desc Upload profile image
// @route POST /user/image
// @access Protected
app.post("/user/image", FBAuth, uploadImage);

// @desc Add user details
// @route POST /user
// @access Protected
app.post("/user", FBAuth, addUserDetails);

// @desc Get details of logged in user
// @route GET /user
// @access Protected
app.get("/user", FBAuth, getAuthenticatedUser);

// To make our routes /api
// ie. https://website.com/api/ROUTE
exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore
    .document("likes/{id}")
    .onCreate((snapshot) => {
        return (
            db
                .doc(`/posts/${snapshot.data().postId}`)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        return db.doc(`/notifications/${snapshot.id}`).set({
                            createdAt: new Date().toISOString(),
                            recipient: doc.data().userHandle,
                            sender: snapshot.data().userHandle,
                            type: "like",
                            read: false,
                            postId: doc.id,
                        });
                    }
                })
                // no returns or status code since this is a database trigger not API end point
                .then(() => {
                    return;
                })
                .catch((err) => {
                    console.error(err);
                    return;
                })
        );
    });

exports.deleteNotificationOnUnLike = functions.firestore
    .document("likes/{id}")
    .onDelete((snapshot) => {
        return db
            .doc(`/notifications/${snapshot.id}`)
            .delete()
            .then(() => {
                return;
            })
            .catch((err) => {
                console.error(err);
                return;
            });
    });

exports.createNotificationOnComment = functions.firestore
    .document("comments/{id}")
    .onCreate((snapshot) => {
        db.doc(`/posts/${snapshot.data().postId}`)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: "comment",
                        read: false,
                        postId: doc.id,
                    });
                }
            })
            // no returns or status code since this is a database trigger not API end point
            .then(() => {
                return;
            })
            .catch((err) => {
                console.error(err);
                return;
            });
    });
