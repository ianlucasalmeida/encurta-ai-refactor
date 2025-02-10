const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { User } = require('../config/db'); 


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); 
    cb(null, uniqueSuffix + ext); 
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo inválido. Apenas JPEG, PNG e GIF são permitidos.'));
    }
  },
}).single('profileImage');

router.get('/settings', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login'); 
  }
  res.render('settings', {
    user: req.session.user,
    error: null,
    success: null,
  });
});

router.post('/update-profile', async (req, res) => {
  const userId = req.session.userId;
  const { name, email } = req.body;

  upload(req, res, async (err) => {
    if (err) {
      console.error('Erro ao fazer upload da imagem:', err.message);
      return res.render('settings', {
        user: req.session.user,
        error: err.message,
        success: null,
      });
    }

    try {
      const updateData = { name, email };

      if (req.file) {
        const profileImagePath = `/uploads/${req.file.filename}`;
        updateData.profileImage = profileImagePath;
        req.session.user.profileImage = profileImagePath; 
      }

      const [rowsUpdated] = await User.update(updateData, { where: { id: userId } });

      if (rowsUpdated === 0) {
        return res.render('settings', {
          user: req.session.user,
          error: 'Erro ao atualizar perfil. Usuário não encontrado.',
          success: null,
        });
      }

      req.session.user.name = name;
      req.session.user.email = email;

      res.render('settings', {
        user: req.session.user,
        error: null,
        success: 'Perfil atualizado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.render('settings', {
        user: req.session.user,
        error: 'Erro ao atualizar perfil. Tente novamente mais tarde.',
        success: null,
      });
    }
  });
});

module.exports = router;