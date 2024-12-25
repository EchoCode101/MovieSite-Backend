import { DataTypes } from "sequelize";

export default (sequelize) => {
  const UserSessionHistory = sequelize.define("UserSessionHistories", {
    session_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Members",
        key: "member_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    login_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    logout_time: {
      type: DataTypes.DATE,
      allowNull: true, // Will be set on logout
    },
    ip_address: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    device_info: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Determines if the session is still active
    },
  });

  UserSessionHistory.associate = (models) => {
    UserSessionHistory.belongsTo(models.Members, {
      foreignKey: "member_id",
      as: "user",
    });
  };

  return UserSessionHistory;
};
