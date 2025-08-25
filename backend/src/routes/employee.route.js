const express = require('express');
const { uploadEmployeesFromExcel , uploadSingleEmployee, uploadSingleEmployeeToNeon,uploadEmployeesFromExcelToNeon } = require('../controllers/employee.controller.js');
const { verifyJWT } = require('../middleware/auth.middleware.js');
const uploadExcel = require("../middleware/multerExcel.js");
const router = express.Router();


router.post('/upload-employee', verifyJWT, uploadSingleEmployee);
router.post('/upload-excel-employee', verifyJWT, uploadExcel.single('file'), uploadEmployeesFromExcel);
router.post('/upload-employee-neon', verifyJWT, uploadSingleEmployeeToNeon);
router.post('/upload-excel-employee-neon', verifyJWT, uploadExcel.single('file'), uploadEmployeesFromExcelToNeon);

module.exports = router;