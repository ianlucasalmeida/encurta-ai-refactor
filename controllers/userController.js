const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

exports.updateProfile = [
  upload.single('profileImage'),
  async (req, res) => {
    const { name, email } = req.body;
    const profileImage = req.file;
    const userId = req.session.userId;

    try {
      
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).send('Usuário não encontrado.');
      }

      
      user.name = name || user.name;
      user.email = email || user.email;

      if (profileImage) {
        user.profileImage = `/images/${profileImage.filename}`;
      }

      await user.save();

      res.redirect('/settings');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).send('Erro ao atualizar perfil. Tente novamente mais tarde.');
    }
  },
];