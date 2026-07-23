const asyncHandler = require('express-async-handler');
const Ticket = require('../models/Ticket');

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = asyncHandler(async (req, res) => {
  const { subject, description } = req.body;

  const ticket = new Ticket({
    user: req.user._id,
    subject,
    description,
    messages: [
      {
        sender: req.user._id,
        content: description,
      }
    ]
  });

  const createdTicket = await ticket.save();
  res.status(201).json(createdTicket);
});

// @desc    Get all tickets (Admin/Support)
// @route   GET /api/tickets
// @access  Private/Admin/Support
const getTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({}).populate('user', 'id name email');
  res.json(tickets);
});

// @desc    Get logged in user tickets
// @route   GET /api/tickets/my-tickets
// @access  Private
const getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ user: req.user._id });
  res.json(tickets);
});

// @desc    Get ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate('user', 'name email')
    .populate('messages.sender', 'name email role');

  if (ticket) {
    res.json(ticket);
  } else {
    res.status(404);
    throw new Error('Ticket not found');
  }
});

// @desc    Add message to ticket
// @route   POST /api/tickets/:id/messages
// @access  Private
const addTicketMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;

  const ticket = await Ticket.findById(req.params.id);

  if (ticket) {
    const message = {
      sender: req.user._id,
      content,
    };

    ticket.messages.push(message);
    
    // Automatically update status if support replies
    if (req.user.role === 'support' || req.user.role === 'admin') {
      ticket.status = 'In Progress';
    }

    await ticket.save();
    res.status(201).json(ticket);
  } else {
    res.status(404);
    throw new Error('Ticket not found');
  }
});

// @desc    Update ticket status
// @route   PUT /api/tickets/:id/status
// @access  Private/Admin/Support
const updateTicketStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const ticket = await Ticket.findById(req.params.id);

  if (ticket) {
    ticket.status = status;
    const updatedTicket = await ticket.save();
    res.json(updatedTicket);
  } else {
    res.status(404);
    throw new Error('Ticket not found');
  }
});

module.exports = {
  createTicket,
  getTickets,
  getMyTickets,
  getTicketById,
  addTicketMessage,
  updateTicketStatus,
};
