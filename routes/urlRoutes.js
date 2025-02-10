const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');

router.post('/shorten', urlController.shortenUrl);
router.get('/:code', urlController.redirectToOriginal);
router.get('/history', urlController.getHistory);

module.exports = router;
