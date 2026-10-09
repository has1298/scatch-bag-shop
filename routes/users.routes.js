const express = require('express');
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const isLoggedIn = require('../middlewares/isLoggedIn');
const validateObjectId = require('../middlewares/validateObjectId');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.param('id', validateObjectId);

// auth
router.post('/register', authLimiter, authController.registerUser);
router.post('/login', authLimiter, authController.loginUser);
router.post('/logout', authController.logoutUser);

// profile
router.get('/profile', isLoggedIn, userController.profilePage);
router.put('/profile', isLoggedIn, userController.updateProfile);

// my orders
router.get('/orders', isLoggedIn, userController.myOrders);
router.post('/orders/:id/cancel', isLoggedIn, userController.cancelOrder);

module.exports = router;
