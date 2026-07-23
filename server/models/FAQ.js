const mongoose = require('mongoose');

const faqSchema = mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['General', 'Orders', 'Payments', 'Shipping', 'Returns', 'Account', 'Sellers', 'Other'],
    default: 'General',
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;
