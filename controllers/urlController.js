const Url = require('../models/Url');
const Access = require('../models/Access');

// Função para gerar um código curto
function gerarCodigo() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Função para encurtar um link
exports.shortenUrl = async (req, res) => {
  const { url } = req.body;
  const userId = req.session.userId;

  // Validação básica
  if (!url || !url.trim()) {
    return res.status(400).send('A URL é obrigatória.');
  }

  try {
    // Gera um código curto único
    let code = gerarCodigo();

    // Verifica se o código já existe no banco de dados
    let existingUrl = await Url.findOne({ where: { shortUrl: code } });
    while (existingUrl) {
      code = gerarCodigo();
      existingUrl = await Url.findOne({ where: { shortUrl: code } });
    }

    // Salva o link no banco de dados
    await Url.create({ url, shortUrl: code, userId });

    // Renderiza a página com o formulário e a URL encurtada
    res.render('shorten', { shortUrl: `http://localhost:3000/${code}` });
  } catch (error) {
    console.error('Erro ao encurtar link:', error);
    res.status(500).send('Erro ao encurtar link. Tente novamente mais tarde.');
  }
};

// Função para redirecionar um link encurtado
exports.redirectToOriginal = async (req, res) => {
  const { code } = req.params;

  try {
    // Busca o link pelo código curto
    const url = await Url.findOne({ where: { shortUrl: code } });
    if (!url) {
      return res.status(404).render('error', { message: 'Link não encontrado.' });
    }

    // Captura o IP do usuário
    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Registra o acesso
    await Access.create({ date: new Date(), ip: userIp, urlId: url.id });

    // Redireciona para o link original
    res.redirect(url.url);
  } catch (error) {
    console.error('Erro ao redirecionar link:', error);
    res.status(500).render('error', { message: 'Erro ao redirecionar link.' });
  }
};

// Função para listar o histórico de links do usuário
exports.getHistory = async (req, res) => {
  const userId = req.session.userId;

  try {
    // Busca todos os links do usuário com seus acessos
    const links = await Url.findAll({
      where: { userId },
      include: [{ model: Access, as: 'Accesses' }],
      order: [['createdAt', 'DESC']], // Ordena por data de criação (mais recente primeiro)
    });

    // Renderiza a página de histórico
    res.render('history', { links });
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    res.status(500).send('Erro ao carregar histórico. Tente novamente mais tarde.');
  }
};