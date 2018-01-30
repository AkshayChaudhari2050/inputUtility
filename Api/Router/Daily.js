module.exports = (app, db) => {
  var sql = require("mssql");
  var upload = require('express-fileupload');
  app.use(upload());

  var DailySales = require('./PackageBLL')
  var dailySales = new DailySales()

  app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
  });

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
      line = line.replace('"Other Methods (Demo, DON, 3rd Party, Transfer)"', 'Other');
      if (line.indexOf("ate") > 0) {
        //Heading Row
        HeadingColumns = line.split(',');
      } else {
        //Data Rows
        var Rowcolumns = line.split(',');
        // if (err) console.log(err);
        for (var Columns = 1; Columns < Rowcolumns.length; Columns++) {
          if (Rowcolumns[0] == "Totals") {
            break
          }
          for (var i = 0; i < name.length; i++) {
            if (name[i] == '_') {
              break
            }
            var _Hospital = name.substr(0, i + 1);
          }
          var _PaymentMode = (HeadingColumns[Columns])
          var _TransactionAmount = Rowcolumns[Columns].replace("$", '')
          var _PaymentInfoNum = "0";
          var _Total = _TransactionAmount;
          var _Taxes = "0";
          var _TransDate = Rowcolumns[0];
          var _State = "Accepted"

          dailySales.insertData(_PaymentInfoNum, _TransDate, _PaymentMode, _TransactionAmount, _Taxes, _Total, _State, _Hospital)
        }
        console.log("data Inserted Succuslly")
      }
    })

  });
  // Daily Sales package
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
    }).on('end', function () {
      // sql.close();
      console.log("data Inserted Succuslly")
    });
  })
  //Get All Sales Data
  app.get('/api/getAllSales', (req, res) => {
    var request = new sql.Request();
    request.execute('stp_GetSalesData').then(function (recordsets) {
      console.log("returnValue:", recordsets.recordset)
      // res.end(JSON.stringify(recordsets.recordset));
      res.json(recordsets.recordset)
    }).catch(function (err) {
      console.log(err);
    });
  });

  app.post('/api/IbtSales', (req, res) => {
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
    rd.on('line', function (line) {
      if (line.indexOf("ate") > 0) {
        //Heading Row
      } else {
        //Data Rows
        var Rowcolumns = line.split(',');
        // if (err) console.log(err);
        for (var i = 0; i < name.length; i++) {
          if (name[i] == '_') {
            break
          }
          var _Hospital = name.substr(0, i + 1);
        }
        dailySales.DailySaleSave(Rowcolumns[0], Rowcolumns[1], Rowcolumns[2], Rowcolumns[3], Rowcolumns[4], Rowcolumns[5], Rowcolumns[6], _Hospital)
      }
    }).on('end', function () {
      // sql.close();
      console.log("data Inserted Succuslly")
    })
  })
}
