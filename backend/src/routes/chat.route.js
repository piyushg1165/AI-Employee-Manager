const express = require('express');
const { getAllChats, getChatById, getAllMessagesByChatId, createChat, deleteChatById, getChatsByUserId } = require('../controllers/chat.controller.js');
const { verifyJWT } = require('../middleware/auth.middleware.js');

const router = express.Router();

router.get('/getAllChats/:userId', verifyJWT, getAllChats); 
router.get('/getChatById/:id', verifyJWT, getChatById);
router.get('/getAllMessagesByChatId/:chatId', verifyJWT, getAllMessagesByChatId);
router.post('/createChat', verifyJWT, createChat);
router.delete('/deleteChatById/:id', verifyJWT, deleteChatById);
router.get('/getChatsByUserId/:userId', verifyJWT, getChatsByUserId);



module.exports = router;

