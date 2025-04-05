const express = require('express');
const { fetchUser } = require('../middlewares/authMiddleware');
const { verifyAdmin, signup, login } = require('../controllers/authController');

const router = express.Router();

// Definición de rutas para la autenticación

router.get('/verifyadmin', verifyAdmin);
router.post('/signup', signup);
router.post('/login', login);

module.exports = router;