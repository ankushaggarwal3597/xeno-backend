const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const checkoutCreate = require("../webhooks/checkoutCreate");
const checkoutUpdate = require("../webhooks/checkoutUpdate");
// Shopify webhook endpoint
router.post('/shopify', webhookController.handleShopifyWebhook);
router.post("/checkouts/create", checkoutCreate);
router.post("/checkouts/update", checkoutUpdate);

module.exports = router;