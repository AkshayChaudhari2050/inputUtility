class Merchant {
  MerchantSave(MerchantNumber, MerchantName, TransistNumber, Merchantaddress, MerchantDate, merchantday, Terminal, Account, Expirydate,
    Entrytype, TransectionNumber, Amount, AuthCode, CardType, SatlementDate, Sale, Reportdate, Isactualtable, se_id, IsDeleted
  ) {
    var sql = require("mssql");
    var request = new sql.Request();
    request
      .input('Merchantnumber', sql.NVarChar, MerchantNumber)
      .input('Merchantname', sql.NVarChar, MerchantName)
      .input('Transitnumber', sql.Int, TransistNumber)
      .input('Merchantaddress', sql.NVarChar, Merchantaddress)
      .input('Merchantdate', sql.NVarChar, MerchantDate)
      .input('merchantday', sql.NVarChar, MerchantDate)
      .input('Terminal', sql.NVarChar, Terminal)
      .input('Account', sql.NVarChar, Account)
      .input('Expirydate', sql.NVarChar, Expirydate)
      .input('Entrytype', sql.NVarChar, Entrytype)
      .input('Transactionnumber', sql.NVarChar, TransectionNumber)
      .input('Amount', sql.Int, Amount)
      .input('Authcode', sql.NVarChar, AuthCode)
      .input('Cardtype', sql.NVarChar, CardType)
      .input('Settlementdate', sql.NVarChar, SatlementDate)
      .input('Sale', sql.Char, Sale)
      .input('Reportdate', sql.NVarChar, Reportdate)
      .input('Isactualtable', sql.NVarChar, Isactualtable)
      .input('se_id', sql.NVarChar, se_id)
      .input('IsDeleted', sql.NVarChar, IsDeleted)
      .execute('stp_InsertMerchantData', (err, res) => {
          // if (err) throw err;
          // console.log('Last insert ID:', res.MerchantNumber);
        }
        // ).then(result => { 
        //     console.log(result)
        //   }).catch(function (err) {          
      )
  }
}
module.exports = Merchant
