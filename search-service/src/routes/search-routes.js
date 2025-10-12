const express = require('express');
const {searchPostController} = require("../controller/search-controller")
const {autheticateRequest}  = require("../middlewares/auth-middleware")

const router = express.Router();

router.use(autheticateRequest)

router.get('/posts', searchPostController)

module.exports = router;