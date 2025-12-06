// models/Checkout.js
module.exports = (sequelize, DataTypes) => {
  const Checkout = sequelize.define('Checkout', {
    checkoutId: { type: DataTypes.STRING },
    shop: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    completedAt: { type: DataTypes.DATE, allowNull: true },
  });

  return Checkout;
};
