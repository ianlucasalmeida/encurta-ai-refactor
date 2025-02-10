const bcrypt = require('bcryptjs');
const { models } = require('../config/db');

const User = models.User;

// Função para registrar um novo usuário
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // Validação básica dos campos
  if (!name || !email || !password) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  try {
    // Verifica se o email já está cadastrado
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send('Este email já está em uso.');
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário no banco de dados
    await User.create({ name, email, password: hashedPassword });

    // Redireciona para a página de login após o cadastro
    res.redirect('/login');
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).send('Erro ao registrar usuário. Tente novamente mais tarde.');
  }
};

// Função para realizar o login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validação básica dos campos
  if (!email || !password) {
    return res.status(400).send('Email e senha são obrigatórios.');
  }

  try {
    // Busca o usuário pelo email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).send('Email ou senha inválidos.');
    }

    // Verifica a senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Email ou senha inválidos.');
    }

    // Define o usuário na sessão
    req.session.userId = user.id; // Certifique-se de que `req.session` está definido

    // Redireciona para a página inicial
    res.redirect('/home');
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).send('Erro ao fazer login. Tente novamente mais tarde.');
  }
};