const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', customerController.getAllCustomers);
router.get('/search', customerController.searchCustomers);

module.exports = router;