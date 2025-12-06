const { Checkout, Event } = require("../models");

module.exports = async (req, res) => {
  try {
    const data = req.body;
    const shop = req.headers["x-shopify-shop-domain"];

    await Checkout.create({
      checkoutId: data.id.toString(),
      shop,
      email: data.email,
    });

    await Event.create({
      type: "CHECKOUT_STARTED",
      shop,
      checkoutId: data.id.toString(),
      customerEmail: data.email || null,
      rawPayload: JSON.stringify(data),
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("Checkout create webhook error:", err);
    res.sendStatus(500);
  }
};
