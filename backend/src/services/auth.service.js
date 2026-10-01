const bcrypt = require("bcryptjs");

const usuarioRepository = require("../repositories/usuario.repository");
const { gerarToken } = require("../utils/jwt");
const { AppError } = require("../middlewares/errorHandler");

/**
 * Remove campos sensíveis antes de devolver o usuário para o frontend.
 */
function paraDTO(usuario) {
  const { senhaHash, ...usuarioSemSenha } = usuario;
  return usuarioSemSenha;
}

const authService = {
  async login(email, senha) {
    if (!email || !senha) {
      throw new AppError("Informe e-mail e senha.", 400);
    }

    const usuario = await usuarioRepository.buscarPorEmail(email);

    // Mensagem genérica de propósito: não revelar se o e-mail existe ou não.
    if (!usuario || !usuario.ativo) {
      throw new AppError("E-mail ou senha inválidos.", 401);
    }

    const senhaConfere = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaConfere) {
      throw new AppError("E-mail ou senha inválidos.", 401);
    }

    const token = gerarToken(usuario);

    return { usuario: paraDTO(usuario), token };
  },

  async buscarUsuarioAutenticado(usuarioId) {
    const usuario = await usuarioRepository.buscarPorId(usuarioId);
    if (!usuario || !usuario.ativo) {
      throw new AppError("Usuário não encontrado.", 404);
    }
    return paraDTO(usuario);
  },
};

module.exports = authService;
