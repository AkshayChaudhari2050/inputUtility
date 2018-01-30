var sql = require("mssql");
var config = require('config');
var obj = require('./config.json');

var connection = sql.connect(obj.dbConfig, function (err) {
  if (err) {
    throw err;
  }
  if (obj.Hospital.HospitalName === "GRACE") {
    console.log("Hospital Connected To:" + obj.Hospital.HospitalName)
  } else {
    connection.close()
    console.log("Connection Closed..")
  }
});
module.exports = connection

// const config = {
//   user: 'sa',
//   password: 'sapwd',
//   server: '192.168.0.147', // You can use 'localhost\\instance' to connect to named instance
//   // database: 'dbinputUtility',
//   database: 'telus_prhc_utilityportal'
// }