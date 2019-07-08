'use strict';

const User = require("./User");

module.exports = function(sequelize, DataTypes) {
  const Course = sequelize.define('Course', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "Title is required"
        },
        notNull: {
          msg: "Must contain a Title property"
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "Description is required"
        },
        notNull: {
          msg: "Must contain a description property"
        }
      }
    },
    estimatedTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    materialsNeeded: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  Course.associate = (models) => {

    Course.belongsTo(models.User, {
      foreignKey: {
        fieldName: 'userId',
        
      },
    });
  };

  return Course;
};
