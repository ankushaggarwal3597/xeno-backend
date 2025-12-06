module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Customer",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "tenants", key: "id" }
      },

      shopify_customer_id: {
        type: DataTypes.BIGINT,
        allowNull: false
      },

      email: DataTypes.STRING,
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      phone: DataTypes.STRING,

      orders_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },

      total_spent: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },

      created_at_shopify: DataTypes.DATE,
      updated_at_shopify: DataTypes.DATE,

      createdAt: { type: DataTypes.DATE, field: "created_at" },
      updatedAt: { type: DataTypes.DATE, field: "updated_at" }
    },
    {
      tableName: "customers",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["tenant_id", "shopify_customer_id"] },
        { fields: ["email"] }
      ]
    }
  );
};
