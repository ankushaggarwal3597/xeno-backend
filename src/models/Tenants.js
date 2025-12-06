module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Tenant",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      user_id: { type: DataTypes.INTEGER, allowNull: false },

      store_name: DataTypes.STRING,
      shop_domain: DataTypes.STRING,
      access_token: DataTypes.STRING,

      api_key: DataTypes.STRING,
      api_secret: DataTypes.STRING,

      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },

      last_sync_at: DataTypes.DATE,
      webhook_subscriptions: { type: DataTypes.JSON, defaultValue: [] },

      createdAt: { type: DataTypes.DATE, field: "created_at" },
      updatedAt: { type: DataTypes.DATE, field: "updated_at" },
    },
    {
      tableName: "tenants",
      timestamps: true,
    }
  );
};
