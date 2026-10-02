/**
 * Erro de aplicação "esperado" (ex: validação, regra de negócio).
 * Controllers/services devem lançar este erro para retornar uma
 * resposta previsível ao invés de um 500 genérico.
 */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

/**
 * Middleware global de tratamento de erros.
 * Deve ser o último middleware registrado no app.js.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : "Erro interno no servidor. Tente novamente mais tarde.";

  if (!err.isOperational) {
    // Em produção isso deveria ir para um logger (ex: pino/winston).
    console.error("[ERRO NÃO TRATADO]", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = { AppError, errorHandler };
