const Message = require('../models/message.model.js');
const express = require('express');
const { createMessage, deleteMessage, sendMessage} = require('../controllers/message.controller.js');
const { verifyJWT } = require('../middleware/auth.middleware.js');

const router = express.Router();

router.route('/createMessage').post(verifyJWT, createMessage);
router.route('/deleteMessage/:id').delete(verifyJWT, deleteMessage);
router.route('/sendMessage').post(verifyJWT, sendMessage);

module.exports = router;

