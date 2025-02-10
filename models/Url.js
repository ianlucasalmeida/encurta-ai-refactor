const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Url = sequelize.define('Url', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shortUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  // Relacionamentos
  Url.associate = (models) => {
    Url.belongsTo(models.User, { foreignKey: 'userId' }); // Uma URL pertence a um usuário
    Url.hasMany(models.Access, { foreignKey: 'urlId' }); // Uma URL pode ter vários acessos
  };

  return Url;
};