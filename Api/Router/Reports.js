module.exports = (app, db) => {
  var sql = require("mssql");
  app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
  });

  app.post('/api/report/GetDailyBatch', (req, res) => {
    const fromdate = req.body.fromdate;
    const Todate = req.body.Todate;
    const Hospital = req.body.Hospital;
    var request = new sql.Request();
    request.input('FromDate', sql.NVarChar, fromdate)
      .input('ToDate', sql.NVarChar, Todate)
      .input('Hospital', sql.NVarChar, Hospital)
      .execute('stp_GetDailyBatch').then(function (recordsets) {
        // console.log(new Date(recordsets.recordset[1].TransactionDate).toISOString().slice(0, 10));
        // console.log(recordsets)
        res.json(recordsets.recordset)
      }).catch(function (err) {
        console.log(err);
      });
  });
  app.get('/DailyBatchReport', function (req, res) {
    res.sendFile(__dirname + '/DailyBatch.html');
  })

  app.get('/Reconciliation', function (req, res) {
    res.sendFile(__dirname + '/Reconciliation.html');
  })
  // app.get('/api/Reconsilation', function (req, res) {
  app.get('/api/Reconciliation', function (req, res) {
    var request = new sql.Request();
    // request.execute('stp_MerchantData').then(function (recordsets) {
    request.execute('stp_Reconciliation').then(function (recordsets) {
      // console.log(recordsets)
      res.json(recordsets.recordset)
    }).catch(function (err) {
      console.log(err);
    });
  })
  ///
//Book Report InFlow
  app.post('/api/report/sp_BookReport_InflowMerchant', (req, res) => {
    const fromdate = req.body.dtStartDate;
    const Todate = req.body.dtEndDate;
    var request = new sql.Request();
    request.input('dtStartDate', sql.NVarChar, fromdate)
      .input('dtEndDate', sql.NVarChar, Todate)
      .execute('sp_BookReport_InflowMerchant').then(function (recordsets) {
        res.json(recordsets.recordset)
        // console.log(recordsets)
      }).catch(function (err) {
        console.log(err);
      });
  });

  //Book Report OutFlow
  app.post('/api/report/sp_BookReport_OutflowMerchant', (req, res) => {
    const fromdate = req.body.dtStartDate;
    const Todate = req.body.dtEndDate;
    var request = new sql.Request();
    request.input('dtStartDate', sql.NVarChar, fromdate)
      .input('dtEndDate', sql.NVarChar, Todate)
      .execute('sp_BookReport_OutflowMerchant').then(function (recordsets) {
        res.json(recordsets.recordset)
        // console.log(recordsets)
      }).catch(function (err) {
        console.log(err);
      });
  });
  
//STP_RPTRBCDATA Report
  app.post('/api/report/STP_RPTRBCDATA', (req, res) => {
    const fromdate = req.body.dtStartDate;
    const Todate = req.body.dtEndDate;
    var request = new sql.Request();
    request.input('dtStartDate', sql.NVarChar, fromdate)
      .input('dtEndDate', sql.NVarChar, Todate)
      .execute('STP_RPTRBCDATA').then(function (recordsets) {
        res.json(recordsets.recordset)
        // console.log(recordsets)
      }).catch(function (err) {
        console.log(err);
      });
  });
}
