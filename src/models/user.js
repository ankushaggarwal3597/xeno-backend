module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: DataTypes.STRING,
      role: {
        type: DataTypes.ENUM("admin", "user"),
        defaultValue: "user"
      },

      createdAt: { type: DataTypes.DATE, field: "created_at" },
      updatedAt: { type: DataTypes.DATE, field: "updated_at" },
    },
    {
      tableName: "users",
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const bcrypt = require("bcryptjs");
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );

  User.prototype.comparePassword = async function (candidatePassword) {
    const bcrypt = require("bcryptjs");
    return bcrypt.compare(candidatePassword, this.password);
  };

  return User;
};
