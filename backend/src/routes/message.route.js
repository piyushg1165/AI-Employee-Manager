const Message = require('../models/message.model.js');
const express = require('express');
const { getAllMessages, createMessage} = require('../controllers/message.controller.js');

const router = express.Router();

router.route('/getAllMessages').get(getAllMessages);
router.route('/createMessage').post(createMessage);


module.exports = router;

