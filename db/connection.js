const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(`${process.env.DATABASE_URL}?sslmode=no-verify`);

const connect = async () => {
    await sequelize.authenticate();
    await sequelize.sync();
};

try {
    connect();
} catch (error) {
    console.log(error);
}

module.exports = sequelize;