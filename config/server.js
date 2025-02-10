const express = require('express');
const path = require('path');
require('dotenv').config();
const session = require('express-session');
const multer = require('multer'); // Middleware para upload de arquivos

const app = express();

// Configuração do EJS (Template Engine)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middleware para processar dados do formulário
app.use(express.urlencoded({ extended: true })); // Processa dados do formulário
app.use(express.json()); // Processa dados JSON

// Middleware de sessão
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

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads')); // Pasta onde as imagens serão salvas
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Nome único para o arquivo
  },
});

const upload = multer({ storage });

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Rotas
const authRoutes = require('../routes/authRoutes');
const urlRoutes = require('../routes/urlRoutes');
app.use('/', authRoutes);
app.use('/urls', urlRoutes);

// Rota para upload de imagens
app.post('/update-profile', upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.redirect('/login'); // Redireciona para o login se o usuário não estiver autenticado
    }

    const { name, email } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null; // Caminho da imagem

    const { models } = require('../config/db');
    const User = models.User;

    // Atualiza os dados do usuário no banco de dados
    await User.update(
      { name, email, profileImage },
      { where: { id: userId } }
    );

    res.redirect('/settings'); // Redireciona para a página de configurações após a atualização
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).send('Erro ao atualizar perfil.');
  }
});

// Rota de fallback para lidar com rotas inexistentes
app.use((req, res) => {
  res.status(404).render('error', { message: 'Página não encontrada.' });
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});