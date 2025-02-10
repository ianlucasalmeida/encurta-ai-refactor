const express = require('express');
const authController = require('../controllers/authController');
const { models } = require('../config/db');
const Url = models.Url;
const User = models.User;

const router = express.Router();


router.get('/', (req, res) => {
  res.redirect('/login'); 
});

router.get('/register', (req, res) => {
  res.render('register'); 
});

router.post('/register', authController.register);

router.get('/login', (req, res) => {
  res.render('login'); 
});

router.post('/login', authController.login);

router.get('/home', (req, res) => {
  res.render('home'); 
});

router.get('/history', async (req, res) => {
  try {
    
    const userId = req.session.userId;
    if (!userId) {
      return res.redirect('/login'); 
    }

    
    const links = await Url.findAll({
      where: { userId },
      include: ['Accesses'], 
    });

    
    res.render('history', { links });
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    res.status(500).send('Erro ao carregar histórico.');
  }
});


router.get('/settings', async (req, res) => {
  try {
    
    const userId = req.session.userId;
    if (!userId) {
      return res.redirect('/login'); 
    }

    
    const user = await User.findByPk(userId);

    
    res.render('settings', { user });
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    res.status(500).send('Erro ao carregar configurações.');
  }
});

module.exports = router;