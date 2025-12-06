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

    const redirectUri = `${process.env.BACKEND_URL}/api/shopify/callback`;
    const scopes = process.env.SHOPIFY_SCOPES;

    const installUrl =
      `https://${shop}/admin/oauth/authorize?` +
      querystring.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        scope: scopes,
        redirect_uri: redirectUri,
        state: user_id, // ⭐ critical — send user ID
      });

    console.log("Redirecting user to:", installUrl);

    return res.redirect(installUrl);
  } catch (error) {
    console.error("OAuth Start Error:", error);
    return res.status(500).send("Failed to start OAuth");
  }
});

module.exports = router;
