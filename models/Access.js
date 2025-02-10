const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Access = sequelize.define('Access', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    urlId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  // Relacionamento: Um acesso pertence a uma URL
  Access.associate = (models) => {
    Access.belongsTo(models.Url, { foreignKey: 'urlId' });
  };

  return Access;
};