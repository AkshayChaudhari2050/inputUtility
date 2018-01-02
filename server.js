var express = require("express");
var bodyParser = require("body-parser");
router = require('./src/API/route/index');
var app = express();
// var student = require('./student')
// var db = require("./src/API/config/db")
var sql = require("mssql");
const config = {
  user: 'sa',
  password: 'sapwd',
  server: '192.168.0.147', // You can use 'localhost\\instance' to connect to named instance
  database: 'dbinputUtility',
}
var connection = sql.connect(config, function (err) {
  if (err)
    throw err;
});
//var User = require('./orm')
var bcrypt = require('bcrypt');
var morgan = require('morgan')
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
router(app);

app.get("/api/", function (req, res) {
  var password = generator.generate({
    length: 10,
    numbers: true
  });
  console.log("password" + password)
  res.json({
    message: "Express is up!"
  });
});
// sql.close()
// db.sequelize.sync().then(() => {
app.listen(5000, function () {
  console.log("Express running", this.address().port);
});
// })
///login Api
app.post('/api/login', (req, res) => {
  sql.on('error', err => {
    console.log(err)
  });
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
  // sql.close();
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
var upload = require('express-fileupload');
app.use(upload());
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/up.html');
})

/// Daily Sales 
app.post('/api/dailySales', function (req, res) {
  if (req.files.file) {
    var file = req.files.file,
      name = file.name,
      type = file.mimetype;
    data = file.data;
    var uploadpath = __dirname + '/uploads/' + name;
    file.mv(uploadpath, function (err) {
      if (err) {
        console.log("File Upload Failed", name, err);
        res.send("Error Occured!")
      } else {
        console.log("File Uploaded", name);
        res.send('Done! Uploading files')
      }
    });
  } else {
    res.send("No File selected !");
    res.end();
  };
  var Converter = require("csvtojson").Converter;
  var converter = new Converter({});
  converter.fromFile(__dirname + "/uploads/" + name, function (err, result) {
    if (err) {
      console.log("An Error Has Occured");
      console.log(err);
    }
    sql.connect(config, function (err) {
      if (err) console.log(err);
      for (var index = 0; index < result.length; index++) {
        var string = JSON.stringify(result[index]);
        var objectValue = JSON.parse(string);
        //database Fileds
        var Date = result[index].Date
        var POS_Credit = objectValue['POS Credit'].replace('$', '')
        var POS_Debit = objectValue['POS Debit'].replace('$', '')
        var Self_Activation = objectValue['Self-Activation'].replace('$', '')
        var Free_Service = objectValue['Free Service'].replace('$', '')
        var Cash = result[index].Cash.replace('$', '')
        var Other_Methods = objectValue['Other Methods (Demo, DON, 3rd Party, Transfer)'].replace('$', '')
        var Total_After_Taxes = objectValue['Total After Taxes'].replace('$', '')
        var Discount_Amount = objectValue['Discount Amount'].replace('$', '')
        var To_Tx_Disount = objectValue['Total After Taxes and Discount'].replace('$', '')
        var Refund = objectValue['Refund'].replace('$', '')
        var TtlAftrTaxesDisRefund = objectValue['Total After Taxes/Discounts and Refunds'].replace('$', '')
        //created mssql
        var request = new sql.Request();
        request
          .input('Date', sql.NVarChar, Date)
          .input('POS_Credit', sql.NVarChar, POS_Credit)
          .input('POS_Debit', sql.NVarChar, POS_Debit)
          .input('Self_Activation', sql.NVarChar, Self_Activation)
          .input('Free_Service', sql.NVarChar, Free_Service)
          .input('Cash', sql.NVarChar, Cash)
          .input('Other_Methods', sql.NVarChar, Other_Methods)
          .input('Total_After_Taxes', sql.NVarChar, Total_After_Taxes)
          .input('Discount_Amount', sql.NVarChar, Discount_Amount)
          .input('To_Tx_Disount', sql.NVarChar, To_Tx_Disount)
          .input('Refund', sql.NVarChar, Refund)
          .input('TtlAftrTaxesDisRefund', sql.NVarChar, TtlAftrTaxesDisRefund)
          .execute('sp_save_dailySales')
          .then(result => {}).catch(function (err) {
            console.log(err);
          })
      }
    })
    console.log("data Inserted Succuslly")
    // res.json("data Inserted Succuslly")
  });
  sql.close()
  // res.send('File uploa  ded!');
});

app.post('/api/DailySalespackage', function (req, res) {
  if (req.files.file) {
    var file = req.files.file,
      name = file.name,
      type = file.mimetype,
      data = file.data;
    var uploadpath = __dirname + '/uploads/' + name;
    file.mv(uploadpath, function (err) {
      if (err) {
        console.log("File Upload Failed", name, err);
        res.send("Error Occured!")
      } else {
        console.log("File Uploaded", name);
        // res.send('Done! Uploading files')
        // res.send('Done! Uploading files')
      }
    });
  } else {
    res.send("No File selected !");
    res.end();
  };
  var fs = require('fs'),
    readline = require('readline');
  var rd = readline.createInterface({
    input: fs.createReadStream(__dirname + "/uploads/" + name),
    output: process.stdout,
    console: false
  });
  var HeadingColumns;
  sql.on('error', err => {
    console.log(err)
  });
  rd.on('line', function (line) {
    if (line.indexOf("ate") > 0) {
      //Heading Row
      HeadingColumns = line.split(',');
    } else {
      //Data Rows
      var Rowcolumns = line.split(',');
      // if (err) console.log(err);
      for (var Columns = 1; Columns < Rowcolumns.length; Columns++) {
        // var _Days = (HeadingColumns[Columns]).match(/\d+/g);
        var NoOfDays = (HeadingColumns[Columns]).replace(/[^0-9]/g);
        // var NoOfDays =_Days.join("");
        // var str = "HSC_Daily_Sales";
        for (var i = 0; i < name.length; i++) {
          if (name[i] == '_') {
            break
          }
          var Hospital = name.substr(0, i + 1);
        }
        // console.log(Hospital)
        var request = new sql.Request();
        request.input('TransactionDate', sql.NVarChar, Rowcolumns[0])
          .input('Package', sql.NVarChar, HeadingColumns[Columns])
          .input('NoOfPackages', sql.Int, Rowcolumns[Columns])
          .input('Hospital', sql.NVarChar, Hospital)
          .input('NoOfDays', sql.Int, NoOfDays)
          .execute('stp_InsertPackage').then(result => {}).catch(function (err) {
            console.log(err);
          })
      }
    }
    // console.log("data Inserted Succuslly")
    // res.json("data Inserted Succuslly")
  }).on('end', function () {
    // sql.close();
    console.log("data Inserted Succuslly")
  });
})


app.get('/api/getAllSales', (req, res) => {
  var request = new sql.Request();
  request.execute('std_GetSalesData').then(function (recordsets) {
    console.log("returnValue:", recordsets.recordset)
    // res.end(JSON.stringify(recordsets.recordset));
    res.json(recordsets.recordset)
  }).catch(function (err) {
    console.log(err);
  });
});

app.post('/api/MerchantDataInsert', function (req, res) {
  if (req.files.file) {
    var file = req.files.file,
      name = file.name,
      type = file.mimetype;
    data = file.data;
    var uploadpath = __dirname + '/uploads/' + name;
    file.mv(uploadpath, function (err) {
      if (err) {
        console.log("File Upload Failed", name, err);
        res.send("Error Occured!")
      } else {
        console.log("File Uploaded", name);
        res.send('Done! Uploading files')
      }
    });
  } else {
    res.send("No File selected !");
    res.end();
  };
  var Converter = require("csvtojson").Converter;
  var converter = new Converter({});
  converter.fromFile(__dirname + "/uploads/" + name, function (err, result) {
    if (err) {
      console.log("An Error Has Occured");
      console.log(err);
    }
    for (var index = 0; index < result.length; index++) {
      var string = JSON.stringify(result[index]);
      var objectValue = JSON.parse(string);
      //database Fileds
      // var Date = result[index].Date
      var MERCHANT_NAME = objectValue['MERCHANT NAME']
      var reportingMerch = objectValue['REPORTING MERCH #']
      var SEQ = objectValue['SEQ #']
      var TR_DATETIME = objectValue['TR DATE/TIME']
      var CARDHOLDER = objectValue['CARDHOLDER #']
      var AMT = objectValue['AMT']
      var AUTH_CODE = objectValue['AUTH CODE']
      var CARD_TYPE = objectValue['CARD TYPE']
      var BATCH_CLOSE = objectValue['BATCH CLOSE']
      var TR_TYPE = objectValue['TR TYPE']

      // console.log(objectValue)
      var request = new sql.Request();
      request
        .input('Merchantnumber', sql.Int, reportingMerch)
        .input('Merchantname', sql.NVarChar, MERCHANT_NAME)
        .input('Transitnumber', sql.Int, SEQ)
        .input('Merchantaddress', sql.NVarChar, null)
        .input('Merchantdate', sql.NVarChar, TR_DATETIME)
        .input('merchantday', sql.NVarChar, null)
        .input('Terminal', sql.NVarChar, null)
        .input('Account', sql.NVarChar, CARDHOLDER)
        .input('Expirydate', sql.NVarChar, null)
        .input('Entrytype', sql.NVarChar, null)
        .input('Transactionnumber', sql.NVarChar, null)
        .input('Amount', sql.Int, AMT)
        .input('Authcode', sql.NVarChar, AUTH_CODE)
        .input('Cardtype', sql.NVarChar, CARD_TYPE)
        .input('Settlementdate', sql.NVarChar, BATCH_CLOSE)
        .input('Sale', sql.Char, TR_TYPE)
        .input('Reportdate', sql.NVarChar, null)
        // .input('Dateoftemptable', sql.NVarChar, null)
        .input('Isactualtable', sql.NVarChar, null)
        .input('se_id', sql.NVarChar, null)
        .input('IsDeleted', sql.NVarChar, null)
        .execute('stp_InsertMerchantData').then(result => {}).catch(function (err) {
          console.log(err);
        })
    }
    console.log("Data Inserted succes");
  })
});

app.post('/api/Moneris', function (req, res) {
  if (req.files.file) {
    var file = req.files.file,
      name = file.name,
      type = file.mimetype;
    data = file.data;
    var uploadpath = __dirname + '/uploads/' + name;
    file.mv(uploadpath, function (err) {
      if (err) {
        console.log("File Upload Failed", name, err);
        res.send("Error Occured!")
      } else {
        console.log("File Uploaded", name);
        res.send('Done! Uploading files')
      }
    });
  } else {
    res.send("No File selected !");
    res.end();
  };

  var fs = require('fs'),
    readline = require('readline');
  var rd = readline.createInterface({
    input: fs.createReadStream(__dirname + "/uploads/" + name),
    output: process.stdout,
    console: false
  });
  // console.log(rd)
  rd.on('line', function (line) {
    // console.log(line)
    var Rowcolumns = line.split(',');
    for (var Columns = 1; Columns < Rowcolumns.length; Columns++) {
      var Account = Rowcolumns[9].replace(/['"]+/g, '')
      var CardType = Rowcolumns[7].replace(/['"]+/g, '')
      var Sale = Rowcolumns[12]
      var TransistNumber = Rowcolumns[5].replace(/['"]+/g, '')
      var TransectionNumber = Rowcolumns[6]
      var AuthCode = Rowcolumns[13].replace(/['"]+/g, '')
      var Amount = Rowcolumns[12]
      var MtDate = Rowcolumns[2]
      var timeData = Rowcolumns[3].replace(/['"]+/g, '').replace(/[.]+/g, ':')
      var SatlementDate = Rowcolumns[4]
      var MerchantDay = Rowcolumns[2]
      var MerchantNumber = Rowcolumns[0]
    }
    CardType == "01" ? CardType = 'Visa' : CardType = 'MasterCard'
    Sale >= 0 ? Sale = "Sale" : Sale = "Return"
    var MerchantName = name.replace('.csv','')
    // console.log(MerchantName)
    //merchant date
    var finaldate = MtDate.slice(0, 4) + "/" + MtDate.slice(4, 6) + "/" + MtDate.slice(6, 8);
    MerchantDate = finaldate + " " + timeData
    // console.log(MerchantDate)
    var sateDate = SatlementDate.slice(0, 4) + "/" + SatlementDate.slice(4, 6) + "/" + SatlementDate.slice(6, 8);
    SatlementDate = sateDate
    // console.log(SatlementDate)
    var request = new sql.Request();
    request
      .input('Merchantnumber', sql.NVarChar, MerchantNumber)
      .input('Merchantname', sql.NVarChar, MerchantName)
      .input('Transitnumber', sql.Int, TransistNumber)
      .input('Merchantaddress', sql.NVarChar, null)
      .input('Merchantdate', sql.NVarChar, MerchantDate)
      .input('merchantday', sql.NVarChar, null)
      .input('Terminal', sql.NVarChar, null)
      .input('Account', sql.NVarChar, Account)
      .input('Expirydate', sql.NVarChar, null)
      .input('Entrytype', sql.NVarChar, null)
      .input('Transactionnumber', sql.NVarChar, TransectionNumber)
      .input('Amount', sql.Int, Amount)
      .input('Authcode', sql.NVarChar, AuthCode)
      .input('Cardtype', sql.NVarChar, CardType)
      .input('Settlementdate', sql.NVarChar, SatlementDate)
      .input('Sale', sql.Char, Sale)
      .input('Reportdate', sql.NVarChar, null)
      // .input('Dateoftemptable', sql.NVarChar, null)
      .input('Isactualtable', sql.NVarChar, null)
      .input('se_id', sql.NVarChar, null)
      .input('IsDeleted', sql.NVarChar, null)
      .execute('stp_InsertMerchantData').then(result => {}).catch(function (err) {
        console.log(err);
      })
    // console.log("Data Inserted succes");
  }).on('end', function () {
    // sql.close();
    console.log("data Inserted Succuslly")
  });
})

// var csv = require('csv-array');
//  csv.parseCSV(__dirname + "/uploads/GRACEMoneris.cssv", function(data){
//    console.log(JSON.stringify(data));
//  });
