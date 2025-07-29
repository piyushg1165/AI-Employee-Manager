const express = require('express');
const {register, login, logout, getCurrentUser} = require('../controllers/user.controller.js');
const {verifyJWT} = require('../middleware/auth.middleware.js');
const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/').get(verifyJWT, getCurrentUser);
router.route('/logout').post(verifyJWT, logout);



module.exports = router;
