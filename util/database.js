const Sequelize = require('sequelize');

// Replace the following with your AWS RDS details
const sequelize = new Sequelize('mern-mysql', 'admin', '1a2b3c4d5e6f7g8h9i', {
  host: 'mern-mysql.cnmym8uquncp.eu-north-1.rds.amazonaws.com',
  dialect: 'mysql',
  port: 3306, // Explicitly specify the port (optional if default is 3306)
  logging: false, // Disable logging for cleaner output (optional)
  dialectOptions: {
    ssl: {
      require: true, // Enforce SSL connection for security
      rejectUnauthorized: false, // Allow self-signed certificates (optional)
    },
  },
});

module.exports = sequelize;
