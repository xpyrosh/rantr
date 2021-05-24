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
};
