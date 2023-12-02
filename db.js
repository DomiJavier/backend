const mysql = require('mysql');
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'Botello95!',
  database: 'tfg'
});

connection.connect();

module.exports = connection;