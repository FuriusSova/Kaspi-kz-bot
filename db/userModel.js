const { Model, DataTypes } = require("sequelize");
const sequelize = require("./connection");

class User extends Model { }

User.init({
    chat_id: { type: DataTypes.BIGINT, unique: true },
    username : { type: DataTypes.STRING, unique: true },
    subReports: { type: DataTypes.INTEGER, defaultValue: 5 },
    subReportsIfUnlimited : { type: DataTypes.DATE, defaultValue: new Date(2011, 0, 1) }, 
    subReportsTop100IfUnlimited : { type: DataTypes.DATE, defaultValue: new Date(2011, 0, 1) }, 
    subReadyReportsTop100 : { type: DataTypes.INTEGER, defaultValue: 2 },
    isOrderBrandReport: { type: DataTypes.BOOLEAN, defaultValue: false },
    isOrderKeyWordReport: { type: DataTypes.BOOLEAN, defaultValue: false },
    isOrderReport : { type: DataTypes.BOOLEAN, defaultValue: false },
    summaryPayment : { type: DataTypes.INTEGER, defaultValue: 0 },
    dateOfLastPayment : { type: DataTypes.STRING }
}, { sequelize, modelName: 'user', timestamps: false });

module.exports = User;