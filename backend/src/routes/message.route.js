const express = require('express');
const { createMessage, deleteMessage, sendMessage} = require('../controllers/message.controller.js');
const { verifyJWT } = require('../middleware/auth.middleware.js');
const { queryHandler } = require('../controllers/v2/message.controller.js');


const router = express.Router();

router.post('/query',verifyJWT , queryHandler);
router.get('/health', (req, res) => res.json({ ok: true }));
router.route('/createMessage').post(verifyJWT, createMessage);
router.route('/deleteMessage/:id').delete(verifyJWT, deleteMessage);
router.route('/sendMessage').post(verifyJWT, sendMessage);

module.exports = router;

