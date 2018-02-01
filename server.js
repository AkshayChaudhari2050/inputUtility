var express = require("express");
var bodyParser = require("body-parser");
var app = express();
//import databse Connection
require("./Api/Db/db")
demo = require('./Api/index')
demo(app)
var path = require('path');
var sql = require("mssql");
var morgan = require('morgan')
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));
// app.use(demo)
app.use(function (req, res, next) {
  //Enabling CORS 
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
  next();
});
app.use(bodyParser.json())
app.listen(5000, function () {
  console.log("Express running", this.address().port);
});

app.use(express.static(path.join(__dirname, '/api/public')));
var upload = require('express-fileupload');
app.use(upload());

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/up.html');
})
