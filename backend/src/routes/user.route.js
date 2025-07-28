const express = require('express');
const {register, login, logout} = require('../controllers/user.controller.js');

const router = express.Router();

router.route('/register').post(register);
router.route('/login').get(login);
router.route('/logout').get(logout);


module.exports = router;
