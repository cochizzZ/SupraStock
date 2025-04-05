const express = require('express');
const { fetchUser } = require('../middlewares/authMiddleware');
const { user, updateProfile, getUsers, updateUserData, deleteUser, getUser, forgotPassword, resetPassword, verifyResetToken, checkEmail } = require('../controllers/userController');

const router = express.Router();

// Definición de rutas para los usuarios y la autenticación

router.get('/user', fetchUser, user);
router.post('/updateprofile', fetchUser, updateProfile);
router.get('/api/users', getUsers);
router.put('/api/users/:id', updateUserData);
router.delete('/api/users/:id', deleteUser);
router.get('/api/users/:id', getUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyResetToken);
router.post('/check-email', checkEmail);

module.exports = router;