const express = require('express');
const {register, login, logout, getCurrentUser, updateUser} = require('../controllers/user.controller.js');
const {verifyJWT} = require('../middleware/auth.middleware.js');
const router = express.Router();
const upload = require("../middleware/multer.js");



router.route('/register').post(register);
router.route('/login').post(login);
router.route('/').get(verifyJWT, getCurrentUser);
router.route('/logout').post(verifyJWT, logout);
router.route('/update-user').put(verifyJWT, upload.single("image"), updateUser);



module.exports = router;
