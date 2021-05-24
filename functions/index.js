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
    getUserDetails,
    markNotificationsRead,
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

// @desc Get details of logged in user
// @route GET /user
// @access Public
app.get("/user/:handle", getUserDetails);

// @desc Get details of logged in user
// @route GET /user
// @access Public
app.post("/notifications", FBAuth, markNotificationsRead);

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
                    if (
                        doc.exists &&
                        doc.data().userHandle !== snapshot.data().userHandle
                    ) {
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
                .catch((err) => {
                    console.error(err);
                })
        );
    });

exports.deleteNotificationOnUnLike = functions.firestore
    .document("likes/{id}")
    .onDelete((snapshot) => {
        return db
            .doc(`/notifications/${snapshot.id}`)
            .delete()
            .catch((err) => {
                console.error(err);
            });
    });

exports.createNotificationOnComment = functions.firestore
    .document("comments/{id}")
    .onCreate((snapshot) => {
        return (
            db
                .doc(`/posts/${snapshot.data().postId}`)
                .get()
                .then((doc) => {
                    if (
                        doc.exists &&
                        doc.data().userHandle !== snapshot.data().userHandle
                    ) {
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
                .catch((err) => {
                    console.error(err);
                })
        );
    });

exports.onUserImageChange = functions.firestore
    .document("/users/{userId}")
    .onUpdate((change) => {
        console.log(change.before.data());
        console.log(change.after.data());

        if (change.before.data().imageUrl !== change.after.data().imageUrl) {
            console.log("Image changed");
            // changing multiple collections so we need batch
            const batch = db.batch();
            return db
                .collection("posts")
                .where("userHandle", "==", change.before.data().handle)
                .get()
                .then((data) => {
                    data.forEach((doc) => {
                        const post = db.doc(`/posts/${doc.id}`);
                        batch.update(post, {
                            userImage: change.after.data().imageUrl,
                        });
                    });
                    return batch.commit();
                });
        } else return true;
    });

exports.onPostDelete = functions.firestore
    .document("/posts/{postId}")
    .onDelete((snapshot, context) => {
        const postId = context.params.postId;
        const batch = db.batch();
        return (
            db
                // pull all comments connected to post
                .collection("comments")
                .where("postId", "==", postId)
                .get()
                .then((data) => {
                    data.forEach((doc) => {
                        // delete all fetched comments
                        batch.delete(db.doc(`/comments/${doc.id}`));
                    });
                    // pull all likes connected to post
                    return db
                        .collection("likes")
                        .where("postId", "==", postId)
                        .get();
                })
                .then((data) => {
                    data.forEach((doc) => {
                        // delete all fetched likes
                        batch.delete(db.doc(`/likes/${doc.id}`));
                    });
                    // pull all notifications connected to post
                    return db
                        .collection("notifications")
                        .where("postId", "==", postId)
                        .get();
                })
                .then((data) => {
                    data.forEach((doc) => {
                        // delete all fetched notifications
                        batch.delete(db.doc(`/notifications/${doc.id}`));
                    });
                    return batch.commit();
                })
                .catch((err) => {
                    console.error(err);
                })
        );
    });
