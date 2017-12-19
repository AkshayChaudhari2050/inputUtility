const Sequelize = require('sequelize');
const sequelize = new Sequelize("dbinputUtility", "sa", "sapwd", {
  host: "192.168.0.147",
  dialect: "mssql",
  define: {
    timestamps: false,
    freezeTableName: true,
    underscored: true
  }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.role = require('../model/role')(sequelize, Sequelize);
db.user = require('../model/User')(sequelize, Sequelize);
db.Users = require('../model/Users')(sequelize, Sequelize);
// db.Category = require('../model/category')(sequelize, Sequelize);
db.Profile = require('../model/Profile')(sequelize, Sequelize);
// db.ShoppingCart= require('../model/ShoppingCart')(sequelize, Sequelize);
// db.Cart = require('../model/Cart')(sequelize, Sequelize);
// db.Order = require('../model/Order')(sequelize, Sequelize);
module.exports = db;

sequelize
  .authenticate()
  .then(function (err) {
    console.log('Connection has been established successfully.');
  }, function (err) {
    console.log('Unable to connect to the database:', err);
  });
