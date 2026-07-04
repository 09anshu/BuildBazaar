const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
} = require('../controllers/userController');
const { protect, admin, staff } = require('../middleware/authMiddleware');

router.route('/').post(registerUser).get(protect, staff, getUsers);
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
  .get(protect, staff, getUserById)
  .put(protect, admin, updateUser);

module.exports = router;
