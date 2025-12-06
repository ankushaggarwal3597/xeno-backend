const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Load models
db.User = require("./user")(sequelize, Sequelize.DataTypes);
db.Tenant = require("./Tenants")(sequelize, Sequelize.DataTypes);
db.Customer = require("./customer")(sequelize, Sequelize.DataTypes);
db.Order = require("./order")(sequelize, Sequelize.DataTypes);
db.Product = require("./product")(sequelize, Sequelize.DataTypes);

// Associations
db.User.hasMany(db.Tenant, { foreignKey: "user_id" });
db.Tenant.belongsTo(db.User, { foreignKey: "user_id" });

db.Tenant.hasMany(db.Customer, { foreignKey: "tenant_id" });
db.Customer.belongsTo(db.Tenant, { foreignKey: "tenant_id" });

db.Tenant.hasMany(db.Order, { foreignKey: "tenant_id" });
db.Order.belongsTo(db.Tenant, { foreignKey: "tenant_id" });

db.Tenant.hasMany(db.Product, { foreignKey: "tenant_id" });
db.Product.belongsTo(db.Tenant, { foreignKey: "tenant_id" });

db.Customer.hasMany(db.Order, { foreignKey: "customer_id" });
db.Order.belongsTo(db.Customer, { foreignKey: "customer_id" });

module.exports = db;
