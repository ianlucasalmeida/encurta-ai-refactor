const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Função para atualizar o perfil do usuário
exports.updateProfile = [
  upload.single('profileImage'), // Middleware para processar o upload de arquivos
  async (req, res) => {
    const { name, email } = req.body;
    const profileImage = req.file;
    const userId = req.session.userId;

    try {
      // Busca o usuário pelo ID
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).send('Usuário não encontrado.');
      }

      // Atualiza os dados do usuário
      user.name = name || user.name;
      user.email = email || user.email;

      // Atualiza a imagem de perfil, se fornecida
      if (profileImage) {
        user.profileImage = `/images/${profileImage.filename}`;
      }

      // Salva as alterações no banco de dados
      await user.save();

      // Redireciona para a página de configurações
      res.redirect('/settings');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).send('Erro ao atualizar perfil. Tente novamente mais tarde.');
    }
  },
];