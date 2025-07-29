const express = require('express');
const { getAllChats, getChatById, getAllMessagesByChatId, createChat } = require('../controllers/chat.controller.js');

const router = express.Router();

router.get('/getAllChats/:userId', getAllChats); 
router.get('/getChatById/:id', getChatById);
router.get('/getAllMessagesByChatId/:chatId', getAllMessagesByChatId);
router.post('/createChat', createChat);

module.exports = router;

