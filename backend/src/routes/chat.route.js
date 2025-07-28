const express = require('express');
const { getAllChats, getChatById, getAllMessages, createChat } = require('../controllers/chat.controller.js');

const router = express.Router();

router.get('/getAllChats', getAllChats); 
router.get('/getChatById/', getChatById);
router.get('/getAllMessages', getAllMessages);
router.post('/createChat', createChat);

module.exports = router;

