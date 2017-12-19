var session = require('express-session');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var passport = require("passport");
var passportJWT = require("passport-jwt");
//var User = require('./orm')
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt')
jwtOptions.secretOrKey = 'tasmanianDevil';
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var {
  JWT_SECRET
} = require('../config/index');

module.exports = (app, db) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  //get All users
  app.use(cookieParser());
  app.use(passport.initialize());
  var strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    console.log('payload received', jwt_payload);
    db.user.findAll()
      .then(users => {
        userId: jwt_payload.userId
        if (users) {
          next(null, users);
        } else {
          next(null, false);
        }
      });
  });

  passport.use(strategy);
  app.use(session({
    key: 'user_Id',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
  }));

  app.get('/api/user',
    passport.authenticate('jwt', {
      session: false
    }), (req, res) => {
      db.user.findAll()
        .then(users => {
          res.json(users);
        });
    });
  //get User By Id
  app.get('/api/user/:userId', passport.authenticate('jwt', {
    session: false
  }), (req, res) => {
    const userId = req.params.userId;
    db.user.find({
      where: {
        userId: userId
      }
    }).then(user => {
      res.json(user)
    }).catch(function (error) {
      res.status(500).json(error);
    });
  })
  // User data
  app.post('/api/user', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const roleId = req.body.roleId;
    db.user.create({
      email: email,
      password: password,
      roleId: roleId
    }).then(newuser => {
      res.json(newuser)
    }).catch(function (error) {
      res.status(500).json(error);
    });
  })

  app.put('/api/user/:userId', (req, res) => {
    const userId = req.params.userId;
    const updates = {
      email: req.body.email,
      password: req.body.password,
      roleId: req.body.roleId,
    }
    db.user.find({
        where: {
          userId: userId
        }
      })
      .then(users => {
        return users.updateAttributes(updates)
      })
      .then(usersupdate => {
        res.json(usersupdate);
      }).catch(function (error) {
        res.status(500).json(error);
      });
  });
  // DELETE single 
  app.delete('/api/user/:userId', (req, res) => {
    const userId = req.params.userId;
    db.user.destroy({
        where: {
          userId: userId
        }
      })
      .then(Deleteuser => {
        res.json(Deleteuser);
      }).catch(function (error) {
        res.status(500).json(error);
      });
  });

  app.delete('/user/delete/:userId', (req, res) => {
    const userId = req.params.userId;
    db.Users.destroy({
        where: {
          userId: userId
        }
      })
      .then(Deleteuser => {
        res.json(Deleteuser);
      }).catch(function (error) {
        res.status(500).json(error);
      });
  });


  app.post('/api/user/login', (req, res) => {
    var email = req.body.email,
      password = req.body.password;
    db.user.findOne({
      where: {
        email: email
      }
    }).then(function (user) {
      if (!user) {
        res.json({
          succes: false,
          msg: "No User Found"
        })
      } else if (!bcrypt.compareSync(password, user.password)) {
        res.json({
          succes: false,
          msg: "Password Not Match"
        })
      } else {
        var payload = {
          userId: user.userId
        };
        var token = jwt.sign(payload, jwtOptions.secretOrKey, {
          expiresIn: '1h'
        });
        req.session.user = user.dataValues;
        res.json({
          token: token
        });
      }
    });
  });

  app.get('/logout', function (req, res) {
    req.session.destroy(function () {
      console.log("user logged out.")
    });
    //res.redirect('/login');
  });
}
