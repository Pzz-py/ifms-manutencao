/**
 * Rótulos em português das categorias — espelha o que já existe no
 * frontend (`frontend/src/utils/categoriaConfig.js`). Usado apenas para
 * montar o título automático de chamados abertos sem login, onde a
 * pessoa não digita um título.
 */
const CATEGORIA_LABELS = Object.freeze({
  ELETRICA: "Elétrica",
  HIDRAULICA: "Hidráulica",
  INFORMATICA: "Informática",
  MOBILIARIO: "Mobiliário",
  AR_CONDICIONADO: "Ar-condicionado",
  ESTRUTURA: "Estrutura",
  PINTURA: "Pintura",
  LIMPEZA: "Limpeza",
  OUTROS: "Outros",
});

module.exports = { CATEGORIA_LABELS };
