const nodemailer = require('nodemailer');
// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "akshay.chaudhari@balajiinfosol.com", // generated ethereal user
    pass: "akki@2050" // generated ethereal password
  }
});
// setup email data with unicode symbols
var http = require('http');
var express = require('express');
// var nodemailer = require("nodemailer");
var bodyParser = require('body-parser')
var app = express();
var port = Number(process.env.PORT || 1000);
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
}));
// Home page
app.get('/', function (req, res) {
  res.sendfile('index.html');
});
// sending mail function
app.post('/send', function (req, res) {
    if (req.body.email == "" || req.body.subject == "") {
      res.send("Error: Email & Subject should not blank");
      return false;
    }
    // Sending Email Without SMTP
    let mailOptions = {
        from: 'akshay.chaudhari@balajiinfosol.com', // sender address
        to: req.body.email, // list of receivers
        subject: req.body.subject, // Subject line
        text: 'Password Reset', // plain text body
        // html: '<b>password Reset Link</b> http://localhost:5000/reset' // html body
      };
      
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      });      
        res.send("Email has been sent successfully");
});

app.get('/reset', function (req, res) {
    res.sendfile('forgot.html');
});

app.post ('/reset', function (req, res) {
        var password = req.body.password;
        var confirm = req.body.confirm;
        var userId=req.params.userId
        if (password !== confirm) return res.end('passwords do not match');
        res.send("Password Updated Success")
});

var server = http.createServer(app).listen(port, function () {
  console.log("Listening on " + port);
});
