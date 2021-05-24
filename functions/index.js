const functions = require("firebase-functions");

// npm i express
// Init Express
const express = require("express");
const app = express();

// Import utilies
const FBAuth = require("./util/fbAuth");

// Import handlers
const { getAllPosts, newPost } = require("./handlers/posts");
const { signUp, logIn, uploadImage } = require("./handlers/users");

//* */ POST ROUTES/* *//

// @desc Fetch all posts
// @route GET /posts
// @access Public
app.get("/posts", getAllPosts);

// @desc Create new Post
// @route POST /posts
// @access Public
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
// @access Public
app.post("/user/image", FBAuth, uploadImage);

// To make our routes /api
// ie. https://website.com/api/ROUTE
exports.api = functions.https.onRequest(app);
