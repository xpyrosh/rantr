const functions = require("firebase-functions");

// npm i express
// Init Express
const express = require("express");
const app = express();

// Import utilies
const FBAuth = require("./util/fbAuth");

// Import handlers
const { getAllPosts, newPost } = require("./handlers/posts");
const { signUp, logIn } = require("./handlers/users");

// @desc Fetch all posts
// @route GET /posts
// @access Public
app.get("/posts", getAllPosts);

// @desc Create new Post
// @route POST /posts
// @access Public
app.post("/posts", FBAuth, newPost);

// @desc Sign up new user
// @route POST /signup
// @access Public
app.post("/signup", signUp);

// @desc Login user
// @route POST /login
// @access Public
app.post("/login", logIn);

// To make our routes /api
// ie. https://website.com/api/ROUTE
exports.api = functions.https.onRequest(app);
