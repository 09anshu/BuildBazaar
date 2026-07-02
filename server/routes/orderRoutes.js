const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  createEnquiry,
  requestItemReturn,
} = require('../controllers/orderController');
const { protect, admin, seller } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/enquiry').post(protect, createEnquiry);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, protect, seller, updateOrderToDelivered);
router.route('/:id/return-item').put(protect, requestItemReturn);

module.exports = router;
