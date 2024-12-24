import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Admins = sequelize.define(
    "Admins",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true, // Ensure unique email
        validate: {
          isEmail: true, // Validate email format
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING(255),
        allowNull: true, // Not required on registration
      },
      last_name: {
        type: DataTypes.STRING(255),
        allowNull: true, // Not required on registration
      },
      role: {
        type: DataTypes.STRING(50),
        defaultValue: "admin", // Default role
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // Active by default
      },
      lastLogin: {
        type: DataTypes.DATE,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^[0-9]{10,15}$/, // Basic phone number validation
        },
      },
      profileImage: {
        type: DataTypes.STRING,
        allowNull: true, // Optional profile picture
      },
    },
    {
      tableName: "Admins", // Ensure correct table name
      timestamps: true,
      indexes: [
        {
          name: "admin_email_idx",
          unique: true,
          fields: ["email"], // Create index on email
        },
      ],
    }
  );

  return Admins;
};
