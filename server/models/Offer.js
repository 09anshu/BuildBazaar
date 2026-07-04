const mongoose = require('mongoose');

const offerSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    discountCode: {
      type: String,
      unique: true,
      sparse: true, // Allows null/empty values but enforces uniqueness on non-null
    },
    discountPercent: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
