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
    validFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
      default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
