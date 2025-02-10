const express = require('express');
const urlController = require('../controllers/urlController'); // Importa o controlador

const router = express.Router();

// Encurtar URL (POST)
router.post('/new', urlController.shortenUrl);

// Redirecionar para a URL original (GET)
router.get('/:code', urlController.redirectToOriginal);

// Histórico de Links (GET)
router.get('/history', urlController.getHistory);

module.exports = router;