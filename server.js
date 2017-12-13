var lodash = require("lodash");
var express = require("express");
var bodyParser = require("body-parser");
router = require('./src/API/route/index');
var app = express();
var morgan = require('morgan');
// var student = require('./student')
var db = require("./src/API/config/db")


var jwt = require('jsonwebtoken');
var passport = require("passport");
var passportJWT = require("passport-jwt");
//var User = require('./orm')
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;


var jwtOptions = {}
//jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt')
jwtOptions.secretOrKey = 'tasmanianDevil';

// headers.append('Access-Control-Allow-Origin', 'http://localhost:3000');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(function (req, res, next) {
  //Enabling CORS 
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
  next();
});
app.use(bodyParser.json())
router(app, db);

app.get("/api/", function (req, res) {
  res.json({
    message: "Express is up!"
  });
});

db.sequelize.sync().then(() => {
  app.listen(5000, function () {
    console.log("Express running", this.address().port);
  });
})