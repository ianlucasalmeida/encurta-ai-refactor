// Função para gerar um código curto aleatório
function gerarCodigo() {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 5 }, () => possible.charAt(Math.floor(Math.random() * possible.length))).join('');
}

// Carregar dados do localStorage
let urlMap = JSON.parse(localStorage.getItem('urlMap')) || {};

// Salvar dados no localStorage
function salvarDados() {
  localStorage.setItem('urlMap', JSON.stringify(urlMap));
}

// Função para encurtar um link
function encurtarLink(url) {
  let code;
  do {
    code = gerarCodigo();
  } while (urlMap[code]); // Garante que o código seja único

  // Armazena o mapeamento entre o código e a URL
  urlMap[code] = url;
  salvarDados();

  // Retorna o link encurtado
  return `${window.location.origin}/#${code}`;
}

// Função para obter a URL original pelo código
function obterUrlOriginal(code) {
  return urlMap[code];
}