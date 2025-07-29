const express = require('express');
const { getAllChats, getChatById, getAllMessagesByChatId, createChat } = require('../controllers/chat.controller.js');

const router = express.Router();

router.get('/getAllChats', getAllChats); 
router.get('/getChatById/', getChatById);
router.get('/getAllMessagesByChatId', getAllMessagesByChatId);
router.post('/createChat', createChat);

module.exports = router;

