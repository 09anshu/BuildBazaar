const express = require('express');
const router = express.Router();
const {
  getActivityLogs,
  getAllRecentLogs,
} = require('../controllers/activityLogController');
const { protect, supportOrAdmin } = require('../middleware/authMiddleware');

router.route('/').get(protect, supportOrAdmin, getAllRecentLogs);
router.route('/:entityType/:entityId').get(protect, supportOrAdmin, getActivityLogs);

module.exports = router;
