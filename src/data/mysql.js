const path = require('path');
const mysql = require('mysql2');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mysqlConnection = mysql.createConnection({
  host:process.env.MYSQL_MIGRATION_HOST,
  user: process.env.MYSQL_MIGRATION_USER,
  password: process.env.MYSQL_MIGRATION_PASSWORD,
  database: process.env.MYSQL_MIGRATION_DATABASE,
  supportBigNumbers: true
});
const mysqlPromise = mysqlConnection.promise();

module.exports.mysqlPromise = mysqlPromise;
