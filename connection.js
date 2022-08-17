var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "clase",
  password: "12341234",
  database: "todoofertas",
});

// promise wrapper to enable async await with MYSQL
const util = require("util");
connection.query = util.promisify(connection.query).bind(connection);

module.exports = connection;
