const Message = require('../models/message.model.js');
const express = require('express');
const {getMessage, getAllMessages, createMessage} = require('../controllers/message.controller.js');

const router = express.Router();

router.route('/getMessage').get(getMessage);
router.route('/getAllMessages').get(getAllMessages);
router.route('/createMessage').post(createMessage);


module.exports = router;

