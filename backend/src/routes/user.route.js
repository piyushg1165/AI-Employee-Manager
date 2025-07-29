const express = require('express');
const {register, login, logout, getCurrentUser} = require('../controllers/user.controller.js');

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/getCurrentUser').get(getCurrentUser);

router.route('/logout').post(logout);


module.exports = router;
