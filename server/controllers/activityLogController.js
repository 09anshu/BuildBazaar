const asyncHandler = require('express-async-handler');
const ActivityLog = require('../models/ActivityLog');

// @desc    Create an activity log entry
// Helper function used by other controllers
const logActivity = async ({ entityType, entityId, action, details, performedBy }) => {
  try {
    await ActivityLog.create({
      entityType,
      entityId,
      action,
      details,
      performedBy,
    });
  } catch (error) {
    console.error('Failed to log activity:', error.message);
  }
};

// @desc    Get activity logs for a specific entity
// @route   GET /api/activity-logs/:entityType/:entityId
// @access  Private/Support/Admin
const getActivityLogs = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;

  const logs = await ActivityLog.find({ entityType, entityId })
    .populate('performedBy', 'name role')
    .sort({ createdAt: -1 });

  res.json(logs);
});

// @desc    Get all recent activity logs
// @route   GET /api/activity-logs
// @access  Private/Support/Admin
const getAllRecentLogs = asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find({})
    .populate('performedBy', 'name role')
    .sort({ createdAt: -1 })
    .limit(100);

  res.json(logs);
});

module.exports = {
  logActivity,
  getActivityLogs,
  getAllRecentLogs,
};
