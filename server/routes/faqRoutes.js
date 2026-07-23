const express = require('express');
const router = express.Router();
const {
  createFAQ,
  getFAQs,
  getAllFAQs,
  updateFAQ,
  deleteFAQ,
} = require('../controllers/faqController');
const { protect, supportOrAdmin } = require('../middleware/authMiddleware');

// Public route - get published FAQs
router.get('/', getFAQs);

// Support/Admin route - create FAQ
router.post('/', protect, supportOrAdmin, createFAQ);

// Admin/Support route - get all FAQs including unpublished
router.route('/all').get(protect, supportOrAdmin, getAllFAQs);

router.route('/:id')
  .put(protect, supportOrAdmin, updateFAQ)
  .delete(protect, supportOrAdmin, deleteFAQ);

module.exports = router;
