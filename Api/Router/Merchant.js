module.exports = (app, db) => {
  var sql = require("mssql");
  var upload = require('express-fileupload');
  app.use(upload());

  var Merchant = require('./MerchantBLL')
  var merchant = new Merchant()
  //  Daily Sales Package busines Logic
  var DailySales = require('./PackageBLL')
  var dailySales = new DailySales()

  app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
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
          // res.send('Done! Uploading files')
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
      try {
        for (var index = 0; index < result.length; index++) {
          var string = JSON.stringify(result[index]);
          var objectValue = JSON.parse(string);
          // var Date = result[index].Date
          var MerchantName = objectValue['MERCHANT NAME']
          try {
            if (MerchantName == undefined) {
              res.json({
                success: false
              })
              console.log("Erorr")
            }
          } catch (error) {
            break
          }
          var MerchantNumber = objectValue['REPORTING MERCH #']
          var TransistNumber = objectValue['SEQ #']
          var MerchantDate = objectValue['TR DATE/TIME']
          var Account = objectValue['CARDHOLDER #']
          var Amount = objectValue['AMT']
          var AuthCode = objectValue['AUTH CODE']
          var CardType = objectValue['CARD TYPE']
          var SatlementDate = objectValue['BATCH CLOSE']
          var Sale = objectValue['TR TYPE']
          var TransectionNumber = null
          Sale == 'Sale' ? Sale = "S" : Sale = "R"

          merchant.MerchantSave(MerchantNumber, MerchantName, TransistNumber, null, MerchantDate, null, null, Account,
            null, null, TransectionNumber, Amount, AuthCode, CardType, SatlementDate, Sale, null, null, null, null
          )
        }
      } catch (error) {
        console.log("Eror")
        res.json({
          success: false
        })
      }
      // console.log("Data Inserted succes");
    })
  });

  // Merchant moneris Data export to Database
  app.post('/api/Moneris', function (req, res, next) {
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
    const readStream = fs.createReadStream(__dirname + "/uploads/" + name);
    var rd = readline.createInterface({
      input: readStream,
      // output: process.stdout,
      console: false
    });
    rd.on('line', function (line) {
      var Rowcolumns = line.split(',');
      try {
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
        Sale >= 0 ? Sale = "S" : Sale = "R"
        var MerchantName = name.replace('.csv', '')
        var finaldate = MtDate.slice(0, 4) + "/" + MtDate.slice(4, 6) + "/" + MtDate.slice(6, 8);
        MerchantDate = finaldate + " " + timeData
        var sateDate = SatlementDate.slice(0, 4) + "/" + SatlementDate.slice(4, 6) + "/" + SatlementDate.slice(6, 8);
        SatlementDate = sateDate

        merchant.MerchantSave(MerchantNumber, MerchantName, TransistNumber, null, MerchantDate, null, null, Account,
          null, null, TransectionNumber, Amount, AuthCode, CardType, SatlementDate, Sale, null, null, null, null
        )
      } catch (error) {
        console.log(error)
        rd.close()
        res.json({
          success: false
        })
        //   readStream.destroy();
      }
    })
    // .on('close', function () {
    // console.log("data Inserted Succuslly")
    // });
  })

  //daily Sales data Upload to database
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
          // res.send('Done! Uploading files')
          console.log('Done! Uploading files')
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

    rd.on('line', function (line) {
      line = line.replace('"Other Methods (Demo, DON, 3rd Party, Transfer)"', 'Other');
      if (line.indexOf("ate") > 0) {
        //Heading Row
        HeadingColumns = line.split(',');
      } else {
        //Data Rows
        var Rowcolumns = line.split(',');
        // if (err) console.log(err);
        try {
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
            if (_TransactionAmount == "") {
              _TransactionAmount = 0.0
            }
            dailySales.DailySaleSave(_PaymentInfoNum, _TransDate, _PaymentMode, _TransactionAmount, _Taxes, _Total, _State, _Hospital)
          }
          return true
          // res.json({success:true})  
        } catch (error) {
          console.log("error")
          rd.close()
          // res.status(500).json({ error: 'message' });
          res.json({
            success: false
          })
          return false
        }
        // }
      }
    });
  })

  // Daily Sales package
  app.post('/api/DailySalespackage', function (req, res, next) {
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
    const readStream = fs.createReadStream(__dirname + "/uploads/" + name);
    var rd = readline.createInterface({
      input: readStream,
      // output: process.stdout,
      console: false
    });
    var HeadingColumns;

    rd.on('line', function (line) {
      if (line.indexOf("ate") > 0) {
        //Heading Row
        HeadingColumns = line.split(',');
      } else {
        //Data Rows

        var Rowcolumns = line.split(',');
        // if (err) console.log(err);        
        for (var Columns = 1; Columns < Rowcolumns.length; Columns++) {
          try {
            // var _Days = (HeadingColumns[Columns]).match(/\d+/g);
            var NoOfDays = (HeadingColumns[Columns]).replace(/[^0-9]/g);

            for (var i = 0; i < name.length; i++) {
              if (name[i] == '_') {
                break
              }
              var Hospital = name.substr(0, i + 1);
            }
            // console.log(Hospital)
            var request = new sql.Request();
            try {
              request.input('TransactionDate', sql.NVarChar, Rowcolumns[0])
                .input('Package', sql.NVarChar, HeadingColumns[Columns])
                .input('NoOfPackages', sql.Int, Rowcolumns[Columns])
                .input('Hospital', sql.NVarChar, Hospital)
                .input('NoOfDays', sql.Int, NoOfDays)
                .execute('stp_InsertPackage').then(result => {})
                .catch(function (err) {
                  return err
                })
            } catch (error) {
              break
            }
          } catch (error) {            
             rd.close(); 
             console.log(error)
          }
        }
      }
    })
  })

  //Get All Sales Data
  app.get('/api/getAllSales', (req, res) => {
    var request = new sql.Request();
    request.execute('stp_GetSalesData').then(function (recordsets) {
      // console.log("returnValue:", recordsets.recordset)
      // res.end(JSON.stringify(recordsets.recordset));
      res.json(recordsets.recordset)
    }).catch(function (err) {
      console.log(err);
    });
  });

  // Ibt Sales Data
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
      // output: process.stdout,
      console: false
    });

    rd.on('line', function (line) {
      if (line.indexOf("ate") > 0) {
        //Heading Row
      } else {
        //Data Rows
        var Rowcolumns = line.split(',');

        try {
          // if (err) console.log(err);
          for (var i = 0; i < name.length; i++) {
            if (name[i] == '_') {
              break
            }
            var _Hospital = name.substr(0, i + 1);
          }
          try {
            dailySales.DailySaleSave(Rowcolumns[0], Rowcolumns[1], Rowcolumns[2], Rowcolumns[3], Rowcolumns[4], Rowcolumns[5], Rowcolumns[6], _Hospital)
          } catch (error) {
            res.json({
              success: false
            })
            rd.close()
          }
        } catch (error) {}
      }
    })
  })

  app.post('/api/TestDailySalespackage', function (req, res, next) {
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

    var Converter = require("csvtojson").Converter;
    var converter = new Converter({});
    converter.fromFile(__dirname + "/uploads/" + name, function (err, result) {
      if (err) {
        console.log("An Error Has Occured");
        console.log(err);
      }
      try {
        for (var index = 0; index < result.length; index++) {
          var string = JSON.stringify(result[index]);
          var objectValue = JSON.parse(string);
          // var str = "HSC_Daily_Sales";
          for (var i = 0; i < name.length; i++) {
            if (name[i] == '_') {
              break
            }
            var Hospital = name.substr(0, i + 1);
          }
          try {
            for (var i in objectValue) {
              var key = i;
              if (key.indexOf('ate') > 0) {
                var TransactionDate = objectValue[i];
              } else {
                var NoOfPackages = objectValue[i];
                var NoOfDays = key.replace(/[^0-9]/g, '');
                var request = new sql.Request();

                request.input('TransactionDate', sql.NVarChar, TransactionDate)
                  .input('Package', sql.NVarChar, key)
                  .input('NoOfPackages', sql.Int, NoOfPackages)
                  .input('Hospital', sql.NVarChar, Hospital)
                  .input('NoOfDays', sql.Int, NoOfDays)
                  .execute('stp_InsertPackage').then(result => {})
                  .catch(function (err) { // console.log(err);                    
                    try {
                      if (err) {
                        console.log(err)
                        res.json({
                          success: false
                        })
                      }
                    } catch (error) {}

                  })
              }
            }
          } catch (error) {
            console.log("error")
          }
        }
      } catch (error) {
        console.log("error")
      }
    });
  })
}
