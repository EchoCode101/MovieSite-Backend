import { DataTypes } from "sequelize";

export default (sequelize) => {
  const TokenBlacklist = sequelize.define(
    "TokenBlacklist",
    {
      token: {
        type: DataTypes.TEXT, // Supports tokens up to several KB
        allowNull: false,
        primaryKey: true, // Use token as primary key if unique
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "TokenBlacklist",
      timestamps: true,
      indexes: [
        {
          name: "expires_at_idx",
          fields: ["expires_at"], // Create index on email
        },
      ],
    }
  );

  return TokenBlacklist;
};
