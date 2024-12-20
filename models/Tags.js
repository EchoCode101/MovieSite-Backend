import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Tags = sequelize.define("Tags", {
    tag_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tag_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
  });

  Tags.associate = (models) => {
    Tags.belongsToMany(models.Videos, {
      through: models.VideoTags,
      foreignKey: "tag_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      as: "videos",
    });
  };

  return Tags;
};
