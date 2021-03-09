'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class room_option extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models['room_option'].belongsTo(models.room, {foreignKey: "room_id"});
    }
  };
  room_option.init({
    item: DataTypes.STRING,
    room_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'room_option',
  });
  return room_option;
};