module.exports = (app, db) => {
  var sql = require("mssql");
  app.get('/api/ProfileView', (req, res) => {
    var request = new sql.Request();
    request.execute('stp_UserDetails').then(function (recordsets) {
      res.json(recordsets.recordset)
    }).catch(function (err) {
      console.log(err);
    });
  });
}
