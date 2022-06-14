const { Model, DataTypes } = require("sequelize");
const sequelize = require("./connection");

class User extends Model { }

User.init({
    chat_id: { type: DataTypes.INTEGER, unique: true },
    subscription: { type: DataTypes.DATE, defaultValue: null },
    subReports: { type: DataTypes.INTEGER, defaultValue: null },
    isOrderBrandReport: { type: DataTypes.BOOLEAN, defaultValue: false },
    isOrderKeyWordReport: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { sequelize, modelName: 'user', timestamps: false });

module.exports = User;