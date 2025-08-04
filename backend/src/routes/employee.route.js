const express = require('express');
const { uploadEmployee } = require('../controllers/employee.controller.js');
const { verifyJWT } = require('../middleware/auth.middleware.js');

const router = express.Router();

router.post('/upload-employee', verifyJWT, uploadEmployee);

module.exports = router;