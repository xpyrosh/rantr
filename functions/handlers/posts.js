const { db } = require("../util/admin");

exports.getAllPosts = (req, res) => {
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
};

exports.newPost = (req, res) => {
    const newPost = {
        body: req.body.body,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0,
    };

    db.collection("posts")
        .add(newPost)
        .then((doc) => {
            const resPost = newPost;
            resPost.postId = doc.id;
            res.json(resPost);
        })
        .catch((err) => {
            // return 500 server error
            res.status(500).json({ error: "There was an error" });
            console.error(err);
        });
};

// Fetch single post
exports.getPost = (req, res) => {
    let postData = {};

    db.doc(`/posts/${req.params.postId}`)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({ error: "Post not found." });
            }
            postData = doc.data();
            postData.postId = doc.id;

            return db
                .collection("comments")
                .orderBy("createdAt", "desc")
                .where("postId", "==", req.params.postId)
                .get();
        })
        .then((data) => {
            postData.comments = [];
            data.forEach((doc) => {
                postData.comments.push(doc.data());
            });
            return res.json(postData);
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

// Comment on a post
exports.commentOnPost = (req, res) => {
    if (req.body.body.trim() === "")
        return res.status(400).json({ error: "Must not be empty." });

    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        postId: req.params.postId,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl,
    };

    db.doc(`/posts/${req.params.postId}`)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({ error: "Post not found." });
            }
            return doc.ref.update({
                commentCount: doc.data().commentCount + 1,
            });
        })
        .then(() => {
            return db.collection("comments").add(newComment);
        })
        .then(() => {
            res.json(newComment);
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

// Like a post
exports.likePost = (req, res) => {
    // what we need to pull to see if a like exist
    const likeDocument = db
        .collection("likes")
        .where("userHandle", "==", req.user.handle)
        .where("postId", "==", req.params.postId)
        .limit(1);

    // data to pull for current post
    const postDocument = db.doc(`/posts/${req.params.postId}`);

    let postData = {};

    // pull current post then put data into variable
    postDocument
        .get()
        .then((doc) => {
            if (doc.exists) {
                postData = doc.data();
                postData.postId = doc.id;
                // if the post exist and got placed in variable then search for the like and return it
                return likeDocument.get();
            } else {
                return res.status(404).json({ error: "Post not found." });
            }
        })
        .then((data) => {
            // if empty that means we didn't receive a likeDocument from the DB
            if (data.empty) {
                // add a like since we didn't receive one
                return (
                    db
                        .collection("likes")
                        .add({
                            postId: req.params.postId,
                            userHandle: req.user.handle,
                        })
                        // this then needed to be nested due to is empty check, we don't want to do this if not empty
                        .then(() => {
                            postData.likeCount++;
                            return postDocument
                                .update({ likeCount: postData.likeCount })
                                .then(() => {
                                    return res.json(postData);
                                });
                        })
                );
            } else {
                return res.status(400).json({ error: "Post already liked." });
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

// unlike a post
exports.unlikePost = (req, res) => {
    // what we need to pull to see if a like exist
    const likeDocument = db
        .collection("likes")
        .where("userHandle", "==", req.user.handle)
        .where("postId", "==", req.params.postId)
        .limit(1);

    // data to pull for current post
    const postDocument = db.doc(`/posts/${req.params.postId}`);

    let postData = {};

    // pull current post then put data into variable
    postDocument
        .get()
        .then((doc) => {
            if (doc.exists) {
                postData = doc.data();
                postData.postId = doc.id;
                // if the post exist and got placed in variable then search for the like and return it
                return likeDocument.get();
            } else {
                return res.status(404).json({ error: "Post not found." });
            }
        })
        .then((data) => {
            // if empty that means we didn't receive a likeDocument from the DB
            if (data.empty) {
                return res.status(400).json({ error: "Post not liked." });
            } else {
                return db
                    .doc(`/likes/${data.docs[0].id}`)
                    .delete()
                    .then(() => {
                        postData.likeCount--;
                        return postDocument.update({
                            likeCount: postData.likeCount,
                        });
                    })
                    .then(() => {
                        return res.json(postData);
                    });
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

// delete post
