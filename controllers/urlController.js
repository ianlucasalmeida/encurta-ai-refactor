const Url = require('../models/Url');
const Access = require('../models/Access');


function gerarCodigo() {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 5 }, () => possible.charAt(Math.floor(Math.random() * possible.length))).join('');
}


exports.shortenUrl = async (req, res) => {
  const { url } = req.body;
  const userId = req.session.userId;

  if (!url || !url.trim()) {
    return res.status(400).send('A URL é obrigatória.');
  }

  try {
    let code;
    let existingUrl;

    do {
      code = gerarCodigo();
      existingUrl = await Url.findOne({ where: { shortUrl: code } });
    } while (existingUrl);

    await Url.create({ url, shortUrl: code, userId });

    res.render('shorten', { shortUrl: `http://localhost:3000/${code}` });
  } catch (error) {
    console.error('Erro ao encurtar link:', error);
    res.status(500).send('Erro ao encurtar link. Tente novamente mais tarde.');
  }
};

exports.redirectToOriginal = async (req, res) => {
  const { code } = req.params;

  try {
    const url = await Url.findOne({ where: { shortUrl: code } });
    if (!url) {
      return res.status(404).render('error', { message: 'Link não encontrado.' });
    }

    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    await Access.create({ date: new Date(), ip: userIp, urlId: url.id });

    res.redirect(url.url);
  } catch (error) {
    console.error('Erro ao redirecionar link:', error);
    res.status(500).render('error', { message: 'Erro ao redirecionar link.' });
  }
};


exports.getHistory = async (req, res) => {
  const userId = req.session.userId;

  try {
    const links = await Url.findAll({
      where: { userId },
      include: [{ model: Access, as: 'Accesses' }],
      order: [['createdAt', 'DESC']],
    });

    res.render('history', { links });
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    res.status(500).send('Erro ao carregar histórico. Tente novamente mais tarde.');
  }
};
