const express = require('express');
const shopController = require('../controllers/shop.controller');
const isLoggedIn = require('../middlewares/isLoggedIn');

const router = express.Router();

router.get('/', shopController.home);
router.get('/shop', isLoggedIn, shopController.shop);

module.exports = router;
