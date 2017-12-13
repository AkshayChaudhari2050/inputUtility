
module.exports = (sequelize, DataTypes) => {
  const role = sequelize.define('tblrole', {
    roleid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    roleName: {
      type: DataTypes.STRING,
      required: true
    }
  })
  return role
};
