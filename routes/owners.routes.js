const express = require('express');
const ownerController = require('../controllers/owner.controller');
const isOwner = require('../middlewares/isOwner');
const validateObjectId = require('../middlewares/validateObjectId');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.param('id', validateObjectId);

router.get('/login', ownerController.loginPage);
router.post('/login', authLimiter, ownerController.loginOwner);
router.post('/logout', ownerController.logoutOwner);

router.get('/admin', isOwner, ownerController.adminPanel);
router.get('/orders', isOwner, ownerController.ordersPage);
router.patch('/orders/:id/status', isOwner, ownerController.updateOrderStatus);

module.exports = router;
