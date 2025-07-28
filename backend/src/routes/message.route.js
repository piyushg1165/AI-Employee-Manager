const Message = require('../models/message.model.js');
const express = require('express');
const { createMessage} = require('../controllers/message.controller.js');

const router = express.Router();

router.route('/createMessage').post(createMessage);


module.exports = router;

