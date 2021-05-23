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

// helper functions
const isEmpty = (string) => {
    if (string.trim() === "") return true;
    else return false;
};

const isEmail = (email) => {
    const emailRegEx =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(emailRegEx)) return true;
    else return false;
};

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

    let errors = {};

    // Email Validation
    if (isEmpty(newUser.email)) {
        errors.email = "Must not be blank.";
    } else if (!isEmail(newUser.email)) {
        errors.email = "Invalid Email Address.";
    }

    // Password Validation
    if (isEmpty(newUser.password)) errors.password = "Must not be blank.";
    if (newUser.password !== newUser.confirmPassword)
        errors.password = "Passwords do not match.";

    // UserName Validation
    if (isEmpty(newUser.handle)) errors.handle = "Must not be blank.";

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    // Check if user exist then create one if not
    let token, userId;
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
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then((usertoken) => {
            token = usertoken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId: userId,
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
            res.status(201).json({ token });
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

// @desc Login user
// @route POST /login
// @access Public
app.post("/login", (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,
    };

    let errors = {};

    if (isEmpty(user.email)) errors.email = "Must not be empty.";
    if (isEmpty(user.password)) errors.password = "Must not be empty.";

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((data) => {
            return data.user.getIdToken();
        })
        .then((token) => {
            return res.json({ token });
        })
        .catch((err) => {
            console.error(err);
            if (err.code === "auth/wrong-password") {
                return res
                    .status(403)
                    .json({ general: "Wrong credentials, please try again." });
            } else {
                return res.status(500).json({ error: err.code });
            }
        });
});

// To make our routes /api
// ie. https://website.com/api/ROUTE
exports.api = functions.https.onRequest(app);
