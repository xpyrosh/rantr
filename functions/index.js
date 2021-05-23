const functions = require("firebase-functions");
// for access to the database
const admin = require("firebase-admin");

// .firebaserc already knows which project so we don't need to pass one
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//     functions.logger.info("Hello logs!", { structuredData: true });
//     response.send("Hello from Firebase!");
// });

// This is a firebase function to GET all data in the POSTS Collection
exports.getPosts = functions.https.onRequest((req, res) => {
    //admin.firestore() = db
    // returns a promise with querysnapshots
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

// Firebase Function to POST new data to the POST collection
exports.createPost = functions.https.onRequest((req, res) => {
    if (req.method !== "POST") {
        // Wrong request type, return 400 client error
        return res.status(400).json({ error: "Method not allowed" });
    }
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
