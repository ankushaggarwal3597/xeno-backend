const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/overview', analyticsController.getOverview);
router.get('/revenue', analyticsController.getRevenue);
router.get('/top-customers', analyticsController.getTopCustomers);
router.get('/orders-by-date', analyticsController.getOrdersByDate);

module.exports = router;