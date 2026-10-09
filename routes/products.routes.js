const express = require('express');
const productController = require('../controllers/product.controller');
const isOwner = require('../middlewares/isOwner');
const uploadImage = require('../middlewares/uploadImage');
const validateObjectId = require('../middlewares/validateObjectId');

const router = express.Router();

router.param('id', validateObjectId);


router.get('/create', isOwner, productController.createPage);
router.post('/create', isOwner, uploadImage('image'), productController.createProduct);


router.get('/:id/image', productController.productImage);


router.get('/:id/edit', isOwner, productController.editPage);
router.put('/:id', isOwner, uploadImage('image'), productController.updateProduct);
router.patch('/:id/sold-out', isOwner, productController.markSoldOut);
router.delete('/:id', isOwner, productController.deleteProduct);
router.delete('/', isOwner, productController.deleteAllProducts);

module.exports = router;
