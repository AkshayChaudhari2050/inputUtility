const routes = [
  require('./Router/Merchant'),
  require('./Router/Profile'),
  require('./Router/User'),
  require('./Router/Reports'),
  // require('./Router/Daily'),
  // require('./Router/DAily'),
];
// Add access to the app and db objects to each route
module.exports = function router(app, db) {
  return routes.forEach((route) => {
    route(app, db);
  });
};
