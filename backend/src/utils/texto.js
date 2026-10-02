const { AppError } = require("../middlewares/errorHandler");

/** Normaliza para comparar nomes: sem acento, sem caixa, espaços únicos. */
function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Valida e limpa um nome informado pelo usuário (2 a `max` caracteres). */
function validarNome(nome, max = 60) {
  const limpo = (nome || "").replace(/\s+/g, " ").trim();
  if (limpo.length < 2) throw new AppError("Informe um nome com pelo menos 2 caracteres.", 400);
  if (limpo.length > max) throw new AppError(`O nome deve ter no máximo ${max} caracteres.`, 400);
  if (!/[a-zA-ZÀ-ÿ0-9]/.test(limpo)) throw new AppError("O nome deve conter letras ou números.", 400);
  return limpo;
}

module.exports = { normalizar, validarNome };
