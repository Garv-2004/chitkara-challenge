const express = require('express');
const { handlePost, handleGet } = require('../controllers/bfhlController');

const router = express.Router();

// Define BFHL routes
router.post('/', handlePost);
router.get('/', handleGet);

module.exports = router;
