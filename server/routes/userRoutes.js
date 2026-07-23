const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  adminCreateUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
} = require('../controllers/userController');
const { protect, admin, supportOrAdmin } = require('../middleware/authMiddleware');

router.route('/').post(registerUser).get(protect, supportOrAdmin, getUsers);
router.post('/admin-create', protect, admin, adminCreateUser);
router.post('/login', authUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, supportOrAdmin, getUserById)
  .put(protect, admin, updateUser);

module.exports = router;
