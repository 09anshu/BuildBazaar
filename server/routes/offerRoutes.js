const express = require('express');
const router = express.Router();
const {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getAllOffers,
  getOffersByProduct,
  validateCoupon
} = require('../controllers/offerController');
const { protect, sales } = require('../middleware/authMiddleware');

router.route('/').get(getOffers).post(protect, sales, createOffer);
router.route('/all').get(protect, sales, getAllOffers);
router.route('/validate').post(validateCoupon);
router.route('/product/:productId').get(getOffersByProduct);
router.route('/:id').put(protect, sales, updateOffer).delete(protect, sales, deleteOffer);

module.exports = router;
