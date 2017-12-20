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
var bcrypt = require('bcrypt');
//jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt')
jwtOptions.secretOrKey = 'tasmanianDevil';
var generator = require('generate-password');
const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "akshay.chaudhari@balajiinfosol.com", // generated ethereal user
    pass: "akki@2050" // generated ethereal password
  }
});

// headers.append('Access-Control-Allow-Origin', 'http://localhost:3000');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(function (req, res, next) {
  //Enabling CORS 
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
  next();
});
app.use(bodyParser.json())
router(app, db);

app.get("/api/", function (req, res) {
  
var password = generator.generate({
  length: 10,
  numbers: true
});
console.log("password"+password)
  res.json({
    message: "Express is up!"
  });
});
const config = {
  user: 'sa',
  password: 'sapwd',
  server: '192.168.0.147', // You can use 'localhost\\instance' to connect to named instance
  database: 'dbinputUtility',
  options: {
    encrypt: true // Use this if you're on Windows Azure
  }
}

var sql = require("mssql");
var connection = sql.connect(config, function (err) {
  if (err)
    throw err;
});
sql.on('error', err => {
  console.log(err)
})
db.sequelize.sync().then(() => {
  app.listen(5000, function () {
    console.log("Express running", this.address().port);
  });
})
//Apis
app.post('/api/login', (req, res) => {
  var Email = req.body.email,
    password = req.body.password;
  var request = new sql.Request();
  // var hashPassword = bcrypt.hashSync(password, 10);
  request.input('Email', sql.NVarChar, Email)
    .query('select password from tblUsers where Email=@Email and IsDeleted=0', function (err, recordset) {
      if (err) console.log(err);
      if (recordset.recordset.length > 0) {
        var pass = JSON.stringify(recordset.recordset);
        var p = JSON.parse(pass)[0].password
        console.log("password:", p)
        if (bcrypt.compareSync(password, JSON.parse(pass)[0].password)) {
          request.input('Email', sql.NVarChar, Email)
            .input('password', sql.NVarChar, p)
            .execute('stp_UserLogin').then(function (recordsets) {
              console.log("returnValue:", recordsets.returnValue)
              res.json(recordsets)
            }).catch(function (err) {
              console.log(err);
            });
        } else {
          res.json("Invalid Password")
        }
      } else {
        res.json("Email does not Exists")
      }
    });
});

app.post('/api/insert', (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const contactNo = req.body.contactNo;
  const DateOfBirth = req.body.DateOfBirth;
  const address = req.body.address;
  const city = req.body.city;
  const Status = req.body.Status;
  const userId = req.body.userId;
  const Email = req.body.Email
  // const Password = req.body.Password
  const roleId = req.body.roleId
  const modifiedBy = req.body.modifiedBy
  const createdBy = req.body.createdBy
  //hash to password
  var password = generator.generate({
    length: 10,
    numbers: true
  });
  console.log("password"+password)
  var hashPassword = bcrypt.hashSync(password, 10);
  var request = new sql.Request();
  request.input('Email', sql.NVarChar, Email)
    .input('Password', sql.NVarChar, hashPassword)
    .input('roleId', sql.Int, roleId)
    .input('userid', sql.Int, userId)
    .input('firstName', sql.NVarChar, firstName)
    .input('lastName', sql.NVarChar, lastName)
    .input('contactNo', sql.NVarChar, contactNo)
    .input('DateOfBirth', sql.NVarChar, DateOfBirth)
    .input('address', sql.NVarChar, address)
    .input('city', sql.NVarChar, city)
    .input('modifiedBy', sql.Int, modifiedBy)
    .input('createdBy', sql.Int, createdBy)
    .input('Status', sql.Bit, Status)
    .execute('dbo.stp_ProfileSave').then(function (recordsets) {
      console.log("returnValue:", recordsets.returnValue)
      // res.end(JSON.stringify(recordsets.recordset));
      let mailOptions = {
        from: 'akshay.chaudhari@balajiinfosol.com', // sender address
        to: Email, // list of receivers
        subject:"Password" , // Subject line
        text: "Your Password Is="+ password // plain text body
        // html: '<b>password Reset Link</b> {{password}}' // html body
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      });
      res.send("Email has been sent successfully");
    }).catch(function (err) {
      console.log(err);
    });
})
//get All Users View
app.get('/api/ProfileView', (req, res) => {
  var request = new sql.Request();
  request.execute('stp_UserDetails').then(function (recordsets) {
    // console.log("returnValue:", recordsets)
    // res.end(JSON.stringify(recordsets.recordset));
    res.json(recordsets.recordset)
  }).catch(function (err) {
    console.log(err);
  });
});
//get Profile By User
app.get('/api/getProfile/:userId', (req, res) => {
  var request = new sql.Request();
  var userId = req.params.userId
  request.input('userid', sql.Int, userId)
    .execute('stp_GetUserDetails').then(function (recordsets) {
      console.log("returnValue:", recordsets.recordset)
      // res.end(JSON.stringify(recordsets.recordset));
      res.json(recordsets.recordset)
    }).catch(function (err) {
      console.log(err);
    });
});
//Delete User
app.delete('/api/deleteUser/:userId', (req, res) => {
  const userId = req.params.userId;
  var request = new sql.Request();
  request.input('userid', sql.Int, userId)
    .execute('stp_ProfileDelete').then(function (recordsets) {
      console.log("returnValue:", recordsets.returnValue)
      // res.end(JSON.stringify(recordsets.recordset));
      res.json(recordsets.returnValue)
    }).catch(function (err) {
      console.log(err);
    });
}); // DELETE si

app.post('/api/updatePassword', function(req,res) {
  const userId = req.body.userId;
  const password = req.body.password
  var request = new sql.Request();
  var hashPassword = bcrypt.hashSync(password, 10);
    request.input('Password', sql.NVarChar, hashPassword)
    .input('userId', sql.Int, userId)
    .execute('stp_PasswordUpdate').then(function (recordsets) {
      console.log("returnValue:", recordsets.returnValue)
      // res.end(JSON.stringify(recordsets.recordset));
      res.json(recordsets.returnValue)
    }).catch(function (err) {
      console.log(err);
    });
})
