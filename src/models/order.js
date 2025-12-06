module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Order",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "tenants", key: "id" }
      },

      shopify_order_id: {
        type: DataTypes.BIGINT,
        allowNull: false
      },

      order_number: DataTypes.INTEGER,

      customer_id: {
        type: DataTypes.INTEGER,
        references: { model: "customers", key: "id" }
      },

      email: DataTypes.STRING,

      total_price: DataTypes.DECIMAL(10, 2),
      subtotal_price: DataTypes.DECIMAL(10, 2),
      total_tax: DataTypes.DECIMAL(10, 2),
      currency: DataTypes.STRING(3),
      financial_status: DataTypes.STRING,
      fulfillment_status: DataTypes.STRING,

      line_items: DataTypes.JSON,

      created_at_shopify: DataTypes.DATE,
      updated_at_shopify: DataTypes.DATE,

      createdAt: { type: DataTypes.DATE, field: "created_at" },
      updatedAt: { type: DataTypes.DATE, field: "updated_at" }
    },
    {
      tableName: "orders",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["tenant_id", "shopify_order_id"] },
        { fields: ["created_at_shopify"] }
      ]
    }
  );
};
