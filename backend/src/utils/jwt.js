const jwt = require("jsonwebtoken");

/**
 * Gera um token JWT contendo apenas o necessário para identificar
 * o usuário (id e role). Nunca colocamos dados sensíveis no payload,
 * já que o JWT não é criptografado, apenas assinado.
 */
function gerarToken(usuario) {
  return jwt.sign(
    { sub: usuario.id, role: usuario.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function verificarToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { gerarToken, verificarToken };
