const usuarioRepository = require("../repositories/usuario.repository");
const usuarioService = require("../services/usuario.service");

const usuarioController = {
  async listarAdministradores(req, res, next) {
    try {
      const administradores = await usuarioRepository.listarAdministradores();
      res.json({ success: true, data: administradores });
    } catch (err) {
      next(err);
    }
  },

  async atualizarPerfil(req, res, next) {
    try {
      const usuario = await usuarioService.atualizarPerfil(req.usuarioId, req.body);
      res.json({ success: true, data: usuario });
    } catch (err) {
      next(err);
    }
  },

  async alterarSenha(req, res, next) {
    try {
      await usuarioService.alterarSenha(req.usuarioId, req.body);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = usuarioController;
