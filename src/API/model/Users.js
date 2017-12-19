var bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('tblUsers', {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Email: {
      type: DataTypes.STRING,
      required: true
    },
    Password: {
      type: DataTypes.STRING,
      required: true
    },
    createdOn: {
      type: DataTypes.DATE,
      required: true,
      defaultValue: DataTypes.literal('CURRENT_TIMESTAMP')
    },
    modifiedOn: {
      type: DataTypes.DATE,
      required: true,
      defaultValue: DataTypes.literal('CURRENT_TIMESTAMP')
    },    
    IsDeleted: {
      type: DataTypes.BOOLEAN,
      required: true
    },    
    createdBy: {
      type: DataTypes.INTEGER,
      required: true
    },
    modifiedBy: {
      type: DataTypes.INTEGER,
      required: true
    },
    roleId: {
      type: DataTypes.INTEGER,
      required: true,
      references: {
        model: 'role',
        key: 'roleId'
      },
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }
  }, {
    hooks: {
      beforeCreate: (Users) => {
        const salt = bcrypt.genSaltSync();
        Users.Password = bcrypt.hashSync(Users.Password, salt);
      }
    }
  })
  return Users
};
