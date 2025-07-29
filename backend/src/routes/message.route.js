const Message = require('../models/message.model.js');
const express = require('express');
const { createMessage, deleteMessage} = require('../controllers/message.controller.js');

const router = express.Router();

router.route('/createMessage').post(createMessage);
router.route('/deleteMessage/:id').post(deleteMessage);



module.exports = router;

