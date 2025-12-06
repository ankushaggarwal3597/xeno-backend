// routes/shopifyCallbackRoutes.js
const express = require("express");
const axios = require("axios");
const router = express.Router();
const tenantController = require("../controllers/tenantController");
const { User } = require("../models");

router.get("/callback", async (req, res) => {
  try {
    const { shop, code, state } = req.query;

    if (!shop || !code) {
      return res.status(400).send("Missing shop or code");
    }

    // ⭐ user_id is passed through the OAuth "state" parameter
    const userId = state;

    const user = await User.findByPk(userId);
    if (!user) {
      console.error("Invalid user:", userId);
      return res.status(401).send("Invalid user");
    }

    // Exchange code → access token
    const tokenRes = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      {
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      }
    );

    const accessToken = tokenRes.data.access_token;

    // Fetch store info
    const storeInfo = await axios.get(
      `https://${shop}/admin/api/2024-10/shop.json`,
      {
        headers: { "X-Shopify-Access-Token": accessToken },
      }
    );

    const storeName = storeInfo.data.shop.name;

    // Create or update tenant
    await tenantController.createTenantFromOAuth({
      userId,
      storeName,
      shopDomain: shop,
      accessToken,
    });

    return res.redirect(`${process.env.FRONTEND_URL}/settings?connected=true`);
  } catch (err) {
    console.error("OAuth Callback Error:", err.response?.data || err);
    return res.redirect(
      `${process.env.FRONTEND_URL}/settings?error=oauth_failed`
    );
  }
});

module.exports = router;
