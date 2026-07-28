const mysql = require('mysql2/promise');
require('dotenv').config();

// A connection pool is reused across requests instead of opening a new
// TCP connection to RDS on every API call.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  family: 4   // <-- add this line, forces IPv4
});

module.exports = pool;
