module.exports = (app, db) => {
  //get All users
  app.get('/api/roles', (req, res) => {
    db.role.findAll()
      .then(roles => {
        res.json(roles);
      });
  });
  app.get('/api/role/:roleId', (req, res) => {
    const roleId = req.params.roleId;
    db.role.find({
      where: {
        roleId: roleId
      }
    }).then(role => {
      res.json(role)
    }).catch(function (error) {
      res.status(500).json(error);
    });
  })
  //
  app.post('/api/role', (req, res) => {
    const roleName = req.body.roleName;
    db.role.create({
      roleName: roleName
    }).then(newRole => {
      res.json(newRole)
    }).catch(function (error) {
      res.status(500).json(error);
    });
  })

  app.put('/api/role/:roleId', (req, res) => {
    const roleId = req.params.roleId;
    const updates = {
      roleName: req.body.roleName,
    }
    db.role.find({
        where: {
          userid: userid
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
  }); // DELETE single owner
  app.delete('/api/role/:roleId', (req, res) => {
    const roleId = req.params.roleId;
    db.role.destroy({
        where: {
          roleId: roleId
        }
      })
      .then(Deleterole => {
        res.json(Deleterole);
      }).catch(function (error) {
        res.status(500).json(error);
      });
  });
}
