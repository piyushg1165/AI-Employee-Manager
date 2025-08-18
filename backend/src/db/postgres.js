const { Pool } = require('pg');

const pgPool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING,
  max: 20,
});

module.exports = { pgPool };
