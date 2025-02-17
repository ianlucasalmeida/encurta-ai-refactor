const express = require('express');
const path = require('path');
require('dotenv').config();
const session = require('express-session');
const multer = require('multer');
const db = require('../config/db');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'sua_chave_secreta',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 dia
    },
  })
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.use(express.static(path.join(__dirname, '../public')));

app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const User = db.models.User;
      const user = await User.findByPk(req.session.userId);
      res.locals.user = user ? { name: user.name, profileImage: user.profileImage || '/images/default-avatar.png' } : null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
});

const authRoutes = require('../routes/authRoutes');
const urlRoutes = require('../routes/urlRoutes');
app.use('/', authRoutes);
app.use('/urls', urlRoutes);

app.post('/update-profile', upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado. Faça login.' });

    const { name, email } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : undefined;

    const User = db.models.User;
    const [updatedRows] = await User.update(
      { name, email, profileImage },
      { where: { id: userId } }
    );

    if (updatedRows === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.redirect('/settings');
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar perfil.' });
  }
});

app.use((req, res) => {
  res.status(404).render('error', { message: 'Página não encontrada.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
