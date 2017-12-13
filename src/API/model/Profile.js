module.exports = (sequelize, DataTypes) => {
  const Profile = sequelize.define('tblprofile', {
    profileId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING,
      required: true
    },
    lastName: {
      type: DataTypes.STRING,
      required: true
    },
    contactNo: {
      type: DataTypes.STRING,
      required: true
    },
    dateOfBirth: {
      type: DataTypes.STRING,
      required: true
    },
    address: {
      type: DataTypes.STRING,
      required: true
    },
    city: {
      type: DataTypes.STRING,
      required: true
    },
    STATUS: {
      type: DataTypes.STRING,
      required: true
    },
    createdon: {
      type: DataTypes.DATE,
      required: true,
      defaultValue: DataTypes.literal('CURRENT_TIMESTAMP')
    },
    modifiedon: {
      type: DataTypes.DATE,
      required: true,
      defaultValue: DataTypes.literal('CURRENT_TIMESTAMP')
    },
    IsDeleted: {
      type: DataTypes.BOOLEAN,
      required: true,
      defaultValue:false
    },
    createdBy: {
      type: DataTypes.INTEGER,
      required: true
    },
    modifiedBy: {
      type: DataTypes.INTEGER,
      required: true
    },
    userId: {
      type: DataTypes.INTEGER,
      required: true,
      references: {
        model: 'user',
        key: 'userId'
      },
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }
  })
  return Profile
};
