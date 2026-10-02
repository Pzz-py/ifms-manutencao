const { verificarToken } = require("../utils/jwt");
const { AppError } = require("./errorHandler");

/**
 * Exige um token JWT válido no header Authorization (Bearer <token>).
 * Em caso de sucesso, disponibiliza req.usuarioId e req.usuarioRole
 * para os próximos middlewares/controllers.
 */
function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Token de autenticação não informado.", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verificarToken(token);
    req.usuarioId = payload.sub;
    req.usuarioRole = payload.role;
    next();
  } catch (err) {
    next(new AppError("Sessão expirada ou token inválido. Faça login novamente.", 401));
  }
}

/**
 * Restringe o acesso a determinados papéis (roles).
 * Uso: router.get("/rota", autenticar, autorizar("ADMINISTRADOR"), controller)
 */
function autorizar(...rolesPermitidas) {
  return (req, res, next) => {
    if (!rolesPermitidas.includes(req.usuarioRole)) {
      return next(
        new AppError("Você não tem permissão para acessar este recurso.", 403)
      );
    }
    next();
  };
}

module.exports = { autenticar, autorizar };
