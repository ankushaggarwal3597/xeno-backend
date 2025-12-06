// routes/shopifyAuthRoutes.js
const express = require("express");
const router = express.Router();
const querystring = require("querystring");

router.get("/auth", async (req, res) => {
  try {
    const { shop, user_id } = req.query;

    if (!shop || !user_id) {
      return res.status(400).send("Missing shop or user_id");
    }

    if (!shop.endsWith(".myshopify.com")) {
      return res.status(400).send("Invalid shop domain");
    }

    // USE SHOPIFY_REDIRECT_URL (ALWAYS!)
    const redirectUri = process.env.SHOPIFY_REDIRECT_URL;
    const scopes = process.env.SHOPIFY_SCOPES;

    // Safety check
    if (!redirectUri) {
      console.error("❌ SHOPIFY_REDIRECT_URL is missing in environment variables!");
      return res.status(500).send("Server misconfiguration: Missing redirect URL");
    }

    const installUrl =
      `https://${shop}/admin/oauth/authorize?` +
      querystring.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        scope: scopes,
        redirect_uri: redirectUri,
        state: user_id, // used for mapping tenant later
      });

    console.log("==================================================");
    console.log("🚀 STARTING SHOPIFY OAUTH");
    console.log("🛒 Shop:", shop);
    console.log("👤 User ID:", user_id);
    console.log("🔁 Redirect URI Sent:", redirectUri);
    console.log("🔗 Install URL:", installUrl);
    console.log("==================================================");

    return res.redirect(installUrl);
  } catch (error) {
    console.error("🔥 OAuth Start Error:", error);
    return res.status(500).send("Failed to start OAuth");
  }
});

module.exports = router;
