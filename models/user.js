const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const user = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: true,
    get() {
      const value = this.getDataValue('firstName');
      return value;
    },
    set(value) {
      this.setDataValue('firstName', value);
    },
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: true,
    get() {
      const value = this.getDataValue('lastName');
      return value;
    },
    set(value) {
      this.setDataValue('lastName', value);
    },
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    get() {
      const value = this.getDataValue('email');
      return value;
    },
    set(value) {
      this.setDataValue('email', value);
    },
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    get() {
      const value = this.getDataValue('password');
      return value;
    },
    set(value) {
      this.setDataValue('password', value);
    },
  },
  subscription: {
    type: Sequelize.STRING,
    allowNull: true,
    get() {
      const value = this.getDataValue('subscription');
      return value;
    },
    set(value) {
      this.setDataValue('subscription', value);
    },
  },
  sub_status: {
    type: Sequelize.STRING,
    allowNull: true,
    get() {
      const value = this.getDataValue('sub_status');
      return value;
    },
    set(value) {
      this.setDataValue('sub_status', value);
    },
  },
  sub_start_date: {
    type: Sequelize.DATE,
    allowNull: true,
    get() {
      const value = this.getDataValue('sub_start_date');
      return value;
    },
    set(value) {
      this.setDataValue('sub_start_date', value);
    },
  },
  sub_end_date: {
    type: Sequelize.DATE,
    allowNull: true,
    get() {
      const value = this.getDataValue('sub_end_date');
      return value;
    },
    set(value) {
      this.setDataValue('sub_end_date', value);
    },
  },
  sub_id: {
    type: Sequelize.STRING,
    allowNull: true,
    get() {
      const value = this.getDataValue('sub_id');
      return value;
    },
    set(value) {
      this.setDataValue('sub_id', value);
    },
  },
  email_limit: {
    type: Sequelize.INTEGER,
    allowNull: true,
    get() {
      const value = this.getDataValue('email_limit');
      return value;
    },
    set(value) {
      this.setDataValue('email_limit', value);
    },
  },
  email_sent: {
    type: Sequelize.INTEGER,
    allowNull: true,
    get() {
      const value = this.getDataValue('email_sent');
      return value;
    },
    set(value) {
      this.setDataValue('email_sent', value);
    },
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    get() {
      const value = this.getDataValue('isActive');
      return value;
    },
    set(value) {
      this.setDataValue('isActive', value);
    },
  },
  lastLogin: {
    type: Sequelize.DATE,
    allowNull: true,
    get() {
      const value = this.getDataValue('lastLogin');
      return value;
    },
    set(value) {
      this.setDataValue('lastLogin', value);
    },
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
});

module.exports = user;
