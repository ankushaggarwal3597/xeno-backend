const { CheckoutUpdate, Checkout } = require("../models");
const { Op } = require("sequelize");

module.exports = async (req, res) => {
  try {
    const data = req.body;
    const shop = req.headers["x-shopify-shop-domain"];

    await CheckoutUpdate.create({
      checkoutId: data.id.toString(),
      shop,
    });

    await Checkout.update(
      { updatedAt: new Date() },
      { where: { checkoutId: data.id.toString() } }
    );

    res.sendStatus(200);
  } catch (err) {
    console.error("Checkout update webhook error:", err);
    res.sendStatus(500);
  }
};
