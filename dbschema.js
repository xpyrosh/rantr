// File will not be used, just mapping out the DB

let db = {
    users: [
        {
            userId: "s7asdy7sayd79asy890sa",
            email: "user@mail.com",
            handle: "username",
            createdAt: "ISO Date",
            imageUrl: "image/dsaiojhdisaj/dsioajdias",
            bio: "this is my bio",
            website: "mysite",
            location: "Toronto,ON",
        },
    ],
    posts: [
        {
            userHandle: "user",
            body: "This is the body",
            createdAt: "ISO Date",
            likeCount: 5,
            commentCount: 2,
        },
    ],
    comments: [
        {
            userHandle: "username",
            postId: "d89asu89duas",
            body: "a post",
            createdAt: "ISO Date",
        },
    ],
    notifications: [
        {
            recipient: "user",
            sender: "jhon",
            read: "true/false",
            postId: "sa9d0i90sa",
            type: "like/comment",
            createdAt: "ISO Date",
        },
    ],
};

const userDetails = {
    // Redux state
    credentials: {
        userId: "s7asdy7sayd79asy890sa",
        email: "user@mail.com",
        handle: "username",
        createdAt: "ISO Date",
        imageUrl: "image/dsaiojhdisaj/dsioajdias",
        bio: "this is my bio",
        website: "mysite",
        location: "Toronto,ON",
    },
    likes: [
        {
            userHandle: "username",
            postId: "ds9a8ud89as",
        },
        {
            userHandle: "username",
            postId: "dsa89ud9sua",
        },
    ],
};
