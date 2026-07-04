const Offer = require('../models/Offer');

// @desc    Get all offers
// @route   GET /api/offers
// @access  Public
const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ isActive: true });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create an offer
// @route   POST /api/offers
// @access  Private/Sales/Admin
const createOffer = async (req, res) => {
  const { title, discountCode, discountPercent, isActive } = req.body;

  try {
    const offer = new Offer({
      title,
      discountCode: discountCode || undefined,
      discountPercent,
      isActive,
      createdBy: req.user._id,
    });

    const createdOffer = await offer.save();
    res.status(201).json(createdOffer);
  } catch (error) {
    res.status(400).json({ message: 'Invalid offer data', error: error.message });
  }
};

// @desc    Update an offer
// @route   PUT /api/offers/:id
// @access  Private/Sales/Admin
const updateOffer = async (req, res) => {
  const { title, discountCode, discountPercent, isActive } = req.body;

  try {
    const offer = await Offer.findById(req.params.id);

    if (offer) {
      offer.title = title || offer.title;
      offer.discountCode = discountCode !== undefined ? discountCode : offer.discountCode;
      offer.discountPercent = discountPercent || offer.discountPercent;
      offer.isActive = isActive !== undefined ? isActive : offer.isActive;

      const updatedOffer = await offer.save();
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
      await offer.remove();
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
    const offers = await Offer.find({}).populate('createdBy', 'id name');
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


module.exports = {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getAllOffers
};
