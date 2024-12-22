const Sequelize = require('sequelize');

const sequelize = new Sequelize('fashion', 'root', 'redhat', {
  dialect: 'mysql',
  host: 'localhost',
});

module.exports = sequelize;
