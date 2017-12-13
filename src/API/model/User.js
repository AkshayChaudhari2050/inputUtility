var bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('tblUser', {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      required: true
    },
    PASSWORD: {
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
      beforeCreate: (user) => {
        const salt = bcrypt.genSaltSync();
        user.PASSWORD = bcrypt.hashSync(user.PASSWORD, salt);
      }
    }
  })
  return user
};
