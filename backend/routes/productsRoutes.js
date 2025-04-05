const express = require('express');
const { allProducts, removeProduct, addProduct, fullProducts, newCollections, popularinWomen, updateProduct, productDetails } = require('../controllers/productsController');

const router = express.Router();

// Definición de rutas para los productos

router.get('/allproducts', allProducts);
router.post('/removeproduct', removeProduct);
router.post('/addproduct', addProduct);
router.get('/fullproducts', fullProducts);
router.get('/newcollections', newCollections);
router.get('/popularinwomen', popularinWomen);
router.post('/updateproduct', updateProduct);
router.get('/api/products/:productId', productDetails);

module.exports = router;