const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/update-profile', userController.updateProfile);

module.exports = router;