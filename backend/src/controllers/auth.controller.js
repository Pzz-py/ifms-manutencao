const authService = require("../services/auth.service");

const authController = {
  async login(req, res, next) {
    try {
      const { email, senha } = req.body;
      const resultado = await authService.login(email, senha);
      res.json({ success: true, data: resultado });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      const usuario = await authService.buscarUsuarioAutenticado(req.usuarioId);
      res.json({ success: true, data: usuario });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
