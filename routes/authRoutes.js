const express = require('express');
const authController = require('../controllers/authController');
const { models } = require('../config/db');
const Url = models.Url;
const User = models.User;

const router = express.Router();

// Rota para a raiz ("/")
router.get('/', (req, res) => {
  res.redirect('/login'); // Redireciona para a página de login
});

// Página de Cadastro (GET)
router.get('/register', (req, res) => {
  res.render('register'); // Renderiza o arquivo `views/register.ejs`
});

// Processamento do Formulário de Cadastro (POST)
router.post('/register', authController.register);

// Página de Login (GET)
router.get('/login', (req, res) => {
  res.render('login'); // Renderiza o arquivo `views/login.ejs`
});

// Processamento do Formulário de Login (POST)
router.post('/login', authController.login);

// Página Inicial (GET)
router.get('/home', (req, res) => {
  res.render('home'); // Renderiza o arquivo `views/home.ejs`
});

// Histórico de URLs (GET)
router.get('/history', async (req, res) => {
  try {
    // Verifica se o usuário está autenticado
    const userId = req.session.userId;
    if (!userId) {
      return res.redirect('/login'); // Redireciona para o login se o usuário não estiver autenticado
    }

    // Busca todas as URLs encurtadas pelo usuário
    const links = await Url.findAll({
      where: { userId },
      include: ['Accesses'], // Inclui os acessos relacionados a cada URL
    });

    // Renderiza a página de histórico com os links
    res.render('history', { links });
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    res.status(500).send('Erro ao carregar histórico.');
  }
});

// Configurações do Usuário (GET)
router.get('/settings', async (req, res) => {
  try {
    // Verifica se o usuário está autenticado
    const userId = req.session.userId;
    if (!userId) {
      return res.redirect('/login'); // Redireciona para o login se o usuário não estiver autenticado
    }

    // Busca os dados do usuário no banco de dados
    const user = await User.findByPk(userId);

    // Renderiza a página de configurações com os dados do usuário
    res.render('settings', { user });
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    res.status(500).send('Erro ao carregar configurações.');
  }
});

module.exports = router;