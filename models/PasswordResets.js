import { DataTypes } from "sequelize";

export default (sequelize) => {
  const PasswordResets = sequelize.define(
    "PasswordResets",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      reset_token: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true, // Ensure tokens are unique
      },
      reset_token_expiration: {
        type: DataTypes.DATE,
        allowNull: false, // Required to track expiry
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Foreign key to Members
      },
      user_type: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          isIn: [["admin", "user"]], // Ensure a valid user type
        },
      },
      used_at: {
        type: DataTypes.DATE,
        allowNull: true, // Tracks when reset is used
      },
    },
    {
      tableName: "PasswordResets",
      timestamps: true, // Adds createdAt & updatedAt
    }
  );

  return PasswordResets;
};
