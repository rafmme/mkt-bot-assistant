require('dotenv').config();

const { TEST_DB_URL, DATABASE_URL } = process.env;

module.exports = {
  development: {
    username: 'rafmme',
    password: null,
    database: 'lewis',
    host: '127.0.0.1',
    port: '5432',
    dialect: 'postgres',
  },
  test: {
    use_env_variable: 'TEST_DB_URL',
    url: TEST_DB_URL,
    dialect: 'postgres',
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    url: DATABASE_URL,
    ssl: true,
    dialect: 'postgres',
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  },
};
