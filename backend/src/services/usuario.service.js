const bcrypt = require("bcryptjs");
const usuarioRepository = require("../repositories/usuario.repository");
const { AppError } = require("../middlewares/errorHandler");

function paraDTO(usuario) {
  const { senhaHash, ...usuarioSemSenha } = usuario;
  return usuarioSemSenha;
}

const usuarioService = {
  async atualizarPerfil(usuarioId, { nome }) {
    if (!nome?.trim()) {
      throw new AppError("Informe seu nome.", 400);
    }

    const usuario = await usuarioRepository.atualizar(usuarioId, { nome: nome.trim() });
    return paraDTO(usuario);
  },

  async alterarSenha(usuarioId, { senhaAtual, novaSenha }) {
    if (!senhaAtual || !novaSenha) {
      throw new AppError("Informe a senha atual e a nova senha.", 400);
    }
    if (novaSenha.length < 6) {
      throw new AppError("A nova senha deve ter pelo menos 6 caracteres.", 400);
    }

    const usuario = await usuarioRepository.buscarPorId(usuarioId);
    const senhaConfere = await bcrypt.compare(senhaAtual, usuario.senhaHash);
    if (!senhaConfere) {
      throw new AppError("Senha atual incorreta.", 400);
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    await usuarioRepository.atualizar(usuarioId, { senhaHash: novaSenhaHash });
  },
};

module.exports = usuarioService;
