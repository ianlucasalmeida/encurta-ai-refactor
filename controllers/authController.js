const bcrypt = require('bcryptjs');
const { models } = require('../config/db');

const User = models.User;

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  
  if (!name || !email || !password) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  try {
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send('Este email já está em uso.');
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    await User.create({ name, email, password: hashedPassword });

    
    res.redirect('/login');
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).send('Erro ao registrar usuário. Tente novamente mais tarde.');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  
  if (!email || !password) {
    return res.status(400).send('Email e senha são obrigatórios.');
  }

  try {
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).send('Email ou senha inválidos.');
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Email ou senha inválidos.');
    }

    
    req.session.userId = user.id;

    
    res.redirect('/home');
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).send('Erro ao fazer login. Tente novamente mais tarde.');
  }
};