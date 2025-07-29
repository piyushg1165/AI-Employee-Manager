const Message = require('../models/message.model.js');
const express = require('express');
const { createMessage, deleteMessage} = require('../controllers/message.controller.js');
const { verifyJWT } = require('../middleware/auth.middleware.js');

const router = express.Router();

router.route('/createMessage').post(verifyJWT, createMessage);
router.route('/deleteMessage/:id').delete(verifyJWT, deleteMessage);



module.exports = router;

