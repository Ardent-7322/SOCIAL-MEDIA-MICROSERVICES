const express = require("express");
const {createPost, getAllPosts, getSinglePost, deleteSinglePost} = require("../controllers/post-Controller");
const {authenticationRequest} = require('../middlewares/auth-middleware')

const router = express();

//middleware -> this will tell if the user is an auth user or not
router.use(authenticationRequest);

router.post("/create-post", createPost)

module.exports = router;