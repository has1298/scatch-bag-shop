const express = require('express');
const cartController = require('../controllers/cart.controller');
const isLoggedIn = require('../middlewares/isLoggedIn');
const validateObjectId = require('../middlewares/validateObjectId');

const router = express.Router();

router.param('id', validateObjectId);
router.use(isLoggedIn); 

router.get('/', cartController.viewCart);
router.post('/add/:id', cartController.addToCart);


router.get('/checkout', cartController.checkoutPage);
router.post('/checkout', cartController.placeOrder);

router.post('/:id/increase', cartController.increaseQty);
router.post('/:id/decrease', cartController.decreaseQty);
router.delete('/:id', cartController.removeFromCart);

module.exports = router;
