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
  quoteEnquiry,
  proposeCounter,
  salesProposeCounter,
  acceptCounterBySales,
  declineCounterBySales,
  rejectEnquiry,
  acceptQuote,
  getSalesHistory,
  getSalesClosedOrders,
  getStandardOrders,
} = require('../controllers/orderController');
const { protect, admin, sales, supportOrAdmin, staff } = require('../middleware/authMiddleware');

// All orders — Admin only
router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);

// Enquiry orders — Sales + Admin (Quotes Kanban)
router.route('/enquiries').get(protect, sales, getEnquiries);
router.route('/:id/quote').put(protect, sales, quoteEnquiry);
router.route('/:id/counter').put(protect, proposeCounter);
router.route('/:id/counter-by-sales').put(protect, sales, salesProposeCounter);
router.route('/:id/accept-counter').put(protect, sales, acceptCounterBySales);
router.route('/:id/decline-counter').put(protect, sales, declineCounterBySales);
router.route('/:id/reject').put(protect, sales, rejectEnquiry);
router.route('/:id/accept-quote').put(protect, acceptQuote);
router.route('/enquiry').post(protect, createEnquiry);

// Complete sales pipeline history — Sales + Admin (Order History)
router.route('/sales-history').get(protect, sales, getSalesHistory);

// Won/closed deals from the enquiry pipeline — Sales + Admin (Live Sheet)
router.route('/sales-closed').get(protect, sales, getSalesClosedOrders);

// Standard orders — Support + Admin (Order Tracking)
router.route('/standard').get(protect, supportOrAdmin, getStandardOrders);

router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);

// Mark delivered — Sales + Support + Admin
router.route('/:id/deliver').put(protect, staff, updateOrderToDelivered);
router.route('/:id/return-item').put(protect, requestItemReturn);

module.exports = router;

