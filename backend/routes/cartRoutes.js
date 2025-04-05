const express = require('express');
const { addToCart, removeFromCart, getCart, clearCart, updateCart } = require('../controllers/cartController');
const { fetchUser } = require('../middlewares/authMiddleware');

const router = express.Router();

// Definición de rutas para el carrito

router.post('/addtocart', fetchUser, addToCart);
router.post('/removefromcart', fetchUser, removeFromCart);
router.post('/getcart', fetchUser, getCart);
router.delete('/clearcart', fetchUser, clearCart);
router.post('/updatecart', fetchUser, updateCart);

module.exports = router;