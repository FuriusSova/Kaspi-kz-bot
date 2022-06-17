const { Model, DataTypes } = require("sequelize");
const sequelize = require("./connection");

class User extends Model { }

User.init({
    chat_id: { type: DataTypes.INTEGER, unique: true },
    subReports: { type: DataTypes.INTEGER, defaultValue: 5 },
    subReportsIfUnlimited : { type: DataTypes.DATE, defaultValue: null }, 
    subReportsTop100IfUnlimited : { type: DataTypes.DATE, defaultValue: null }, 
    subReadyReportsTop100 : { type: DataTypes.INTEGER, defaultValue: 0 },
    isOrderBrandReport: { type: DataTypes.BOOLEAN, defaultValue: false },
    isOrderKeyWordReport: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { sequelize, modelName: 'user', timestamps: false });

module.exports = User;