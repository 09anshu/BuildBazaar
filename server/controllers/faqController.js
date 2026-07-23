const asyncHandler = require('express-async-handler');
const FAQ = require('../models/FAQ');

// @desc    Create a new FAQ
// @route   POST /api/faqs
// @access  Private/Support/Admin
const createFAQ = asyncHandler(async (req, res) => {
  const { question, answer, category } = req.body;

  const faq = new FAQ({
    question,
    answer,
    category,
    createdBy: req.user._id,
  });

  const createdFAQ = await faq.save();
  res.status(201).json(createdFAQ);
});

// @desc    Get all FAQs (public)
// @route   GET /api/faqs
// @access  Public
const getFAQs = asyncHandler(async (req, res) => {
  const faqs = await FAQ.find({ isPublished: true }).sort({ category: 1, createdAt: -1 });
  res.json(faqs);
});

// @desc    Get all FAQs including unpublished (admin/support)
// @route   GET /api/faqs/all
// @access  Private/Support/Admin
const getAllFAQs = asyncHandler(async (req, res) => {
  const faqs = await FAQ.find({}).populate('createdBy', 'name').sort({ createdAt: -1 });
  res.json(faqs);
});

// @desc    Update a FAQ
// @route   PUT /api/faqs/:id
// @access  Private/Support/Admin
const updateFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);

  if (faq) {
    faq.question = req.body.question || faq.question;
    faq.answer = req.body.answer || faq.answer;
    faq.category = req.body.category || faq.category;
    if (req.body.isPublished !== undefined) {
      faq.isPublished = req.body.isPublished;
    }

    const updatedFAQ = await faq.save();
    res.json(updatedFAQ);
  } else {
    res.status(404);
    throw new Error('FAQ not found');
  }
});

// @desc    Delete a FAQ
// @route   DELETE /api/faqs/:id
// @access  Private/Support/Admin
const deleteFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);

  if (faq) {
    await FAQ.deleteOne({ _id: req.params.id });
    res.json({ message: 'FAQ removed' });
  } else {
    res.status(404);
    throw new Error('FAQ not found');
  }
});

module.exports = {
  createFAQ,
  getFAQs,
  getAllFAQs,
  updateFAQ,
  deleteFAQ,
};
