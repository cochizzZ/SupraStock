const express = require('express');
const { fetchUser } = require('../middlewares/authMiddleware');
const { verifyAdmin, singup, login } = require('../controllers/authController');

const router = express.Router();

// Definición de rutas para la autenticación

router.get('/verifyadmin', verifyAdmin);
router.post('/signup', singup);
router.post('/login', login);

module.exports = router;