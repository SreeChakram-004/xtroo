const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');

// Middleware to verify token
// router.use(authMiddleware.verifyToken);

// Product routes
router.get('/all',authMiddleware.verifyToken, productController.getAllProducts);
router.post('/create',authMiddleware.verifyToken, productController.createProduct);
router.post('/update/:productId',authMiddleware.verifyToken, productController.updateProduct);
router.post('/delete/:productId',authMiddleware.verifyToken, productController.deleteProduct);

module.exports = router;
