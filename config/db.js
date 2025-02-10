require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Configuração do Sequelize usando variáveis de ambiente
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  }
);

// Carregar todos os modelos
const models = {};
const modelsPath = path.join(__dirname, '../models');
fs.readdirSync(modelsPath)
  .filter((file) => file.endsWith('.js'))
  .forEach((file) => {
    const model = require(path.join(modelsPath, file))(sequelize);
    models[model.name] = model;
  });

// Associar os modelos
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

// Teste a conexão e sincronize o banco de dados
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida.');

    // Sincroniza os modelos com o banco de dados
    await sequelize.sync({ alter: true }); // Altera as tabelas sem excluir os dados
    console.log('Tabelas sincronizadas com sucesso.');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  }
})();

module.exports = { sequelize, models };