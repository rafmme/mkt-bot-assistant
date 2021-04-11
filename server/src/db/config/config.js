require('dotenv').config();

const { DEV_DB_URL, TEST_DB_URL, DATABASE_URL } = process.env;

module.exports = {
  development: {
    url: DEV_DB_URL,
    dialect: 'postgres',
  },
  test: {
    url: TEST_DB_URL,
    dialect: 'postgres',
  },
  production: {
    url: DATABASE_URL,
    ssl: true,
    dialect: 'postgres',
    dialectOptions: {
      ssl: true,
    },
  },
};
