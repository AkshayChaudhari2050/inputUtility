module.exports = (app, db) => {
  //get All Profiles
  app.get('/api/Profiles', (req, res) => {
    db.Profile.findAll()
      .then(Profiles => {
        res.json(Profiles);
      });
  });
  //get Profile By Id
  app.get('/api/Profile/:ProfileId', (req, res) => {
    const ProfileId = req.params.ProfileId;
    db.Profile.find({
      where: {
        ProfileId: ProfileId
      }
    }).then(Profile => {
      res.json(Profile)
    })
  })
  // Profile data
  app.post('/api/Profile', (req, res) => {
    // const profileId = req.body.profileId;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const contactNo = req.body.contactNo;
    const dateOfBirth = req.body.dateOfBirth;
    const address = req.body.address;
    const city = req.body.city;
    const STATUS = req.body.STATUS;
    const userId = req.body.userId;
    db.Profile.create({
      // profileId: profileId,
      firstName: firstName,
      lastName: lastName,
      contactNo: contactNo,
      dateOfBirth: dateOfBirth,
      address: address,
      city: city,
      STATUS: STATUS,
      userId: userId
    }).then(newProfile => {
      res.json(newProfile)
    })
  })

  app.put('/api/Profile/:ProfileId', (req, res) => {
    const ProfileId = req.params.ProfileId;
    const updates = {
      profileId: req.body.profileId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      contactNo: req.body.contactNo,
      dateOfBirth: req.body.dateOfBirth,
      address: req.body.address,
      city: req.body.city,
      STATUS: req.body.STATUS,
      userId: req.body.userId
    }
    db.Profile.find({
        where: {
          ProfileId: ProfileId
        }
      })
      .then(Profiles => {
        return Profiles.updateAttributes(updates)
      })
      .then(Profilesupdate => {
        res.json(Profilesupdate);
      });
  });
  // DELETE single 
  app.delete('/api/Profile/:ProfileId', (req, res) => {
    const ProfileId = req.params.ProfileId;
    db.Profile.destroy({
        where: {
          ProfileId: ProfileId
        }
      })
      .then(DeleteProfile => {
        res.json(DeleteProfile);
      });
  });
}
