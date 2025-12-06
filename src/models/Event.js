// models/Event.js
module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define("Event", {
    type: DataTypes.STRING,       // CHECKOUT_STARTED / ABANDONED_CART
    shop: DataTypes.STRING,
    checkoutId: DataTypes.STRING,
    customerEmail: DataTypes.STRING,
    rawPayload: DataTypes.TEXT,
  });

  return Event;
};
