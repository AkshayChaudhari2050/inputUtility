module.exports = (app, db) => {

  var sql = require("mssql");
  var bodyParser = require("body-parser");
  var bcrypt = require('bcrypt');
  var morgan = require('morgan')
   app.use(bodyParser.json())
  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  var generator = require('generate-password');
  ///mail 
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

  app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
  });
  // login Api
  app.post('/api/login', (req, res) => {
    var Email = req.body.email,
      password = req.body.password;
    var request = new sql.Request();
    // var hashPassword = bcrypt.hashSync(password, 10);
    request
      .input('Email', sql.NVarChar, Email)
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
                console.log("returnValue:", recordsets.recordset[0].IsFirstTime)
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

  //Register APi
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
    console.log("password=" + password)
    var hashPassword = bcrypt.hashSync(password, 10);
    sql.on('error', err => {
      console.log(err)
    });
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
          subject: "Password", // Subject line
          text: "Your Password Is=" + password // plain text body
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
    // sql.close();
  })

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
  });
  // update Password
  app.post('/api/updatePassword', function (req, res) {
    const userId = req.body.userId;
    const oldpass = req.body.oldpass
    const password = req.body.password
    var request = new sql.Request();
    // var hashPassword = bcrypt.hashSync(password, 10);
    request.input('userId', sql.Int, userId)
      .query('select password from tblUsers where userId=@userId and IsDeleted=0', function (err, recordset) {
        if (err) console.log(err);
        if (recordset.recordset.length > 0) {
          var pass = JSON.stringify(recordset.recordset);
          var p = JSON.parse(pass)[0].password
          console.log("password:", p)

          if (bcrypt.compareSync(oldpass, p)) {
            var hashPassword = bcrypt.hashSync(password, 10);
            request.input('Password', sql.NVarChar, hashPassword)
              .input('userId', sql.Int, userId)
              .execute('stp_PasswordUpdate').then(function (recordsets) {
                console.log("returnValue:", recordsets.returnValue)
                // res.end(JSON.stringify(recordsets.recordset));
                res.json(recordsets)
              }).catch(function (err) {
                console.log(err);
              });
          } else {
            res.json('invalid password')
          }
        }
      })
  })
}
