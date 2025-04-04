const express = require('express');
const { fetchUser } = require('../middlewares/authMiddleware');
const { addOrder, getOrders, getUserOrders, updateOrder, updateOrderStatus, createOrder, createPayment, getStatistics, getOrdersForStatistics } = require('../controllers/ordersController');

const router = express.Router();

router.post('/addorder', addOrder)
router.get('/api/orders', getOrders)
router.get('/api/user/orders', fetchUser, getUserOrders)
router.put('/orders/:orderId', updateOrder)
router.put('/api/orders/:id', updateOrderStatus)
router.post('/api/orders', createOrder)
router.post('/api/create-payment-intent', fetchUser, createPayment)
router.get('/api/statistics', getStatistics)
router.get('/api/sales', getOrdersForStatistics)

module.exports = router;