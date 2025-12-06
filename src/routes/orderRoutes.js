const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', orderController.getAllOrders);

module.exports = router;