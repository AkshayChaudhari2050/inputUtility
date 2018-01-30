 class DailySales {

   DailySaleSave(_PaymentInfoNum, _TransDate, _PaymentMode, _TransactionAmount, _Taxes, _Total, _State, _Hospital) {
     var sql = require("mssql");
     var request = new sql.Request();
     request
       .input('PaymentInfoNum', sql.NVarChar, _PaymentInfoNum)
       .input('Transdate', sql.NVarChar, _TransDate)
       .input('Method', sql.NVarChar, _PaymentMode)
       .input('Amount', sql.NVarChar, _TransactionAmount)
       .input('Taxes', sql.NVarChar, _Taxes)
       .input('Total', sql.NVarChar, _Total)
       .input('State', sql.NVarChar, _State)
       .input('Hospital', sql.NVarChar, _Hospital)
       .execute('stp_SaveDailySales')
       .then(function (recordsets, err) {         
        //  var returnValue=recordsets.returnValue         
         if (err) {
           console.log("Error")           
         }
       }).catch(function (err) {
         console.log(err);
       })
   }
 }
 module.exports = DailySales
