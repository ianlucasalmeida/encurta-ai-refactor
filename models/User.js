const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profileImage: {
      type: DataTypes.STRING, // Caminho da imagem de perfil
      allowNull: true,
    },
  }, {
    tableName: 'users', // Nome da tabela no banco de dados
    timestamps: true, // Habilita os campos createdAt e updatedAt
  });

  return User;
};