
const routes = [
    require('./UserApi'),
    require('./roleApi'),
    // require('./CategoryApi'),
    require('./ProfileApi'),
    // require('./CartApi'),
    // require('./ShoppingCartApi'),
    // require('./OrdersApi')
  ];
  // Add access to the app and db objects to each route
  module.exports = function router(app, db) {
    return routes.forEach((route) => {
      route(app, db);
    });
  };
  // const routes = [
  //   require('./UserApi'),
  //   require('./roleApi')  ,
  //   require('./CategoryApi'),
  //   require('./ProductApi'),
  //   require('./CartApi'),
  //   require('./ShoppingCartApi'),
  //   require('./OrdersApi')
  // ];