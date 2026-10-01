/**
 * Extrai uma mensagem de erro amigável de uma resposta de erro do axios,
 * caindo para uma mensagem genérica quando a API não informa detalhes
 * (ex: backend fora do ar, erro de rede).
 */
export function getErrorMessage(error, fallback = "Algo deu errado. Tente novamente.") {
  return error?.response?.data?.message || fallback;
}
