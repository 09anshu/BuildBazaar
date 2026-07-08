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
  getEnquiries,
  getStandardOrders,
} = require('../controllers/orderController');
const { protect, admin, sales, supportOrAdmin, staff } = require('../middleware/authMiddleware');

// All orders — Admin only
router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);

// Enquiry orders — Sales + Admin (Quotes Kanban)
router.route('/enquiries').get(protect, sales, getEnquiries);
router.route('/enquiry').post(protect, createEnquiry);

// Standard orders — Support + Admin (Order Tracking)
router.route('/standard').get(protect, supportOrAdmin, getStandardOrders);

router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);

// Mark delivered — Sales + Support + Admin
router.route('/:id/deliver').put(protect, staff, updateOrderToDelivered);
router.route('/:id/return-item').put(protect, requestItemReturn);

module.exports = router;
