const functions = require("firebase-functions");

// npm i express
// Init Express
const express = require("express");
const app = express();

// Import utilies
const FBAuth = require("./util/fbAuth");

// Import handlers
const { getAllPosts, newPost } = require("./handlers/posts");
const {
    signUp,
    logIn,
    uploadImage,
    addUserDetails,
} = require("./handlers/users");

//* */ POST ROUTES/* *//

// @desc Fetch all posts
// @route GET /posts
// @access Public
app.get("/posts", getAllPosts);

// @desc Create new Post
// @route POST /posts
// @access Protected
app.post("/posts", FBAuth, newPost);

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

// To make our routes /api
// ie. https://website.com/api/ROUTE
exports.api = functions.https.onRequest(app);
