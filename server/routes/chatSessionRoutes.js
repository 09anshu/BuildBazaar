const express = require('express');
const router = express.Router();
const {
  createChatSession,
  escalateToHuman,
  claimChatSession,
  addChatMessage,
  closeChatSession,
  getChatSessions,
  getChatSessionById,
  getChatHistory,
} = require('../controllers/chatSessionController');
const { protect, supportOrAdmin } = require('../middleware/authMiddleware');

router.route('/').post(protect, createChatSession).get(protect, supportOrAdmin, getChatSessions);
router.route('/history').get(protect, supportOrAdmin, getChatHistory);
router.route('/:id').get(protect, getChatSessionById);
router.route('/:id/escalate').put(protect, escalateToHuman);
router.route('/:id/claim').put(protect, supportOrAdmin, claimChatSession);
router.route('/:id/messages').post(protect, addChatMessage);
router.route('/:id/close').put(protect, supportOrAdmin, closeChatSession);

module.exports = router;
