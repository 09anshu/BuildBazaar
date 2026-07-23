const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'Order',
  },
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Open', 'In Progress', 'Closed'],
    default: 'Open',
  },
  messages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
      content: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }
  ],
}, {
  timestamps: true,
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
