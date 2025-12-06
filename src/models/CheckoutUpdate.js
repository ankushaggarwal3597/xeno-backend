// models/CheckoutUpdate.js
module.exports = (sequelize, DataTypes) => {
  const CheckoutUpdate = sequelize.define('CheckoutUpdate', {
    checkoutId: DataTypes.STRING,
    shop: DataTypes.STRING,
  });

  return CheckoutUpdate;
};
