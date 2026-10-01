/**
 * Gera o código público (slug) usado na URL do QR Code de um local,
 * a partir do nome informado. Ex: "Laboratório 01" -> "LABORATORIO-01".
 *
 * A unicidade final é garantida em `local.service.js` (que acrescenta
 * um sufixo numérico em caso de colisão), este utilitário só cuida
 * da normalização do texto.
 */
function gerarCodigoBase(nome) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-") // qualquer coisa que não seja letra/número vira hífen
    .replace(/^-+|-+$/g, "") // remove hífens nas pontas
    .replace(/-{2,}/g, "-"); // colapsa hífens repetidos
}

module.exports = { gerarCodigoBase };
