const express = require('express');
const { fetchUser } = require('../middlewares/authMiddleware');
const { verifyAdmin } = require('../controllers/authController');

const router = express.Router();

router.get('/verifyadmin', verifyAdmin);

module.exports = router;