const Chat = require('../models/chat.model.js');
const express = require('express');
const {getAllChats, getChatById, getAllMessages} = require('../controllers/chat.controller.js');

const router = express.Router();

router.route('/getAllChats').get(getAllChats);
router.route('/getChatById').get(getChatById);


module.exports = router;

