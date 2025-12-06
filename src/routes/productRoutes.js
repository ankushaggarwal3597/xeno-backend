const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', productController.getAllProducts);

module.exports = router;