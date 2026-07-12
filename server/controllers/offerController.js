const Offer = require('../models/Offer');

// @desc    Get all offers
// @route   GET /api/offers
// @access  Public
const getOffers = async (req, res) => {
  try {
    const currentDate = new Date();
    const offers = await Offer.find({
      isActive: true,
      validFrom: { $lte: currentDate },
      validUntil: { $gte: currentDate }
    });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create an offer
// @route   POST /api/offers
// @access  Private/Sales/Admin
const createOffer = async (req, res) => {
  const { title, discountCode, discountPercent, isActive, applicableProducts, validFrom, validUntil } = req.body;

  try {
    const offer = new Offer({
      title,
      discountCode: discountCode || undefined,
      discountPercent,
      isActive,
      applicableProducts: applicableProducts || [],
      validFrom: validFrom ? new Date(validFrom) : undefined,
      validUntil: validUntil ? new Date(validUntil) : undefined,
      createdBy: req.user._id,
    });

    const createdOffer = await offer.save();
    // Broadcast updated offers list
    try {
      const emitter = req.io || global.io;
      if (emitter) emitter.emit('offerListUpdated');
    } catch (emitErr) {
      console.error('Error emitting offerListUpdated (create):', emitErr.message);
    }

    res.status(201).json(createdOffer);
  } catch (error) {
    res.status(400).json({ message: 'Invalid offer data', error: error.message });
  }
};

// @desc    Update an offer
// @route   PUT /api/offers/:id
// @access  Private/Sales/Admin
const updateOffer = async (req, res) => {
  const { title, discountCode, discountPercent, isActive, applicableProducts, validFrom, validUntil } = req.body;

  try {
    const offer = await Offer.findById(req.params.id);

    if (offer) {
      offer.title = title || offer.title;
      offer.discountCode = discountCode !== undefined ? discountCode : offer.discountCode;
      offer.discountPercent = discountPercent || offer.discountPercent;
      offer.isActive = isActive !== undefined ? isActive : offer.isActive;
      offer.applicableProducts = applicableProducts !== undefined ? applicableProducts : offer.applicableProducts;
      if (validFrom) offer.validFrom = new Date(validFrom);
      if (validUntil) offer.validUntil = new Date(validUntil);

      const updatedOffer = await offer.save();
      try {
        const emitter = req.io || global.io;
        if (emitter) emitter.emit('offerListUpdated');
      } catch (emitErr) {
        console.error('Error emitting offerListUpdated (update):', emitErr.message);
      }

      res.json(updatedOffer);
    } else {
      res.status(404).json({ message: 'Offer not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating offer', error: error.message });
  }
};

// @desc    Delete an offer
// @route   DELETE /api/offers/:id
// @access  Private/Sales/Admin
const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (offer) {
      await offer.deleteOne();
      try {
        const emitter = req.io || global.io;
        if (emitter) emitter.emit('offerListUpdated');
      } catch (emitErr) {
        console.error('Error emitting offerListUpdated (delete):', emitErr.message);
      }

      res.json({ message: 'Offer removed' });
    } else {
      res.status(404).json({ message: 'Offer not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error deleting offer', error: error.message });
  }
};

// @desc    Get all offers (Admin/Sales - includes inactive)
// @route   GET /api/offers/all
// @access  Private/Sales/Admin
const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find({}).populate('createdBy', 'id name').populate('applicableProducts', 'id name');
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get offers applicable to a specific product
// @route   GET /api/offers/product/:productId
// @access  Public
const getOffersByProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const currentDate = new Date();

    // Find active offers that are valid today and either site-wide or specific to product
    const offers = await Offer.find({
      isActive: true,
      validFrom: { $lte: currentDate },
      validUntil: { $gte: currentDate },
      $or: [
        { applicableProducts: { $size: 0 } },
        { applicableProducts: productId }
      ]
    });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Validate a discount code against cart items
// @route   POST /api/offers/validate
// @access  Public
const validateCoupon = async (req, res) => {
  const { code, productIds } = req.body;

  try {
    const offer = await Offer.findOne({ discountCode: code, isActive: true });

    if (!offer) {
      return res.status(404).json({ message: 'Invalid or expired coupon code' });
    }

    const currentDate = new Date();
    if (currentDate < offer.validFrom) {
      return res.status(400).json({ message: 'This coupon is not active yet' });
    }
    if (currentDate > offer.validUntil) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    // Check if the offer applies to any products in the cart
    let isApplicable = false;
    if (offer.applicableProducts.length === 0) {
      // Site-wide offer
      isApplicable = true;
    } else {
      // Check if there's an intersection between offer's products and cart's products
      const offerProductStrings = offer.applicableProducts.map(id => id.toString());
      isApplicable = productIds.some(id => offerProductStrings.includes(id));
    }

    if (!isApplicable) {
      return res.status(400).json({ message: 'This coupon is not valid for any items in your cart' });
    }

    res.json({
      _id: offer._id,
      title: offer.title,
      discountCode: offer.discountCode,
      discountPercent: offer.discountPercent,
      applicableProducts: offer.applicableProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


module.exports = {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getAllOffers,
  getOffersByProduct,
  validateCoupon
};
