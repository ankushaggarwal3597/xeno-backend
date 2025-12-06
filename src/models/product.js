module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Product",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "tenants", key: "id" }
      },

      shopify_product_id: {
        type: DataTypes.BIGINT,
        allowNull: false
      },

      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      vendor: DataTypes.STRING,
      product_type: DataTypes.STRING,
      status: DataTypes.STRING,

      variants: DataTypes.JSON,
      images: DataTypes.JSON,

      created_at_shopify: DataTypes.DATE,
      updated_at_shopify: DataTypes.DATE,

      createdAt: { type: DataTypes.DATE, field: "created_at" },
      updatedAt: { type: DataTypes.DATE, field: "updated_at" }
    },
    {
      tableName: "products",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["tenant_id", "shopify_product_id"] }
      ]
    }
  );
};
