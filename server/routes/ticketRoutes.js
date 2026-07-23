const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getMyTickets,
  getTicketById,
  addTicketMessage,
  updateTicketStatus,
} = require('../controllers/ticketController');
const { protect, supportOrAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createTicket)
  .get(protect, supportOrAdmin, getTickets);

router.route('/my-tickets').get(protect, getMyTickets);

router.route('/:id')
  .get(protect, getTicketById);

router.route('/:id/messages')
  .post(protect, addTicketMessage);

router.route('/:id/status')
  .put(protect, supportOrAdmin, updateTicketStatus);

module.exports = router;
