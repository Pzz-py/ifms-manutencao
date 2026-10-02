const notificacaoService = require("../services/notificacao.service");

const notificacaoController = {
  async listar(req, res, next) {
    try {
      const apenasNaoLidas = req.query.apenasNaoLidas === "true";
      const notificacoes = await notificacaoService.listar(req.usuarioId, { apenasNaoLidas });
      res.json({ success: true, data: notificacoes });
    } catch (err) {
      next(err);
    }
  },

  async contarNaoLidas(req, res, next) {
    try {
      const total = await notificacaoService.contarNaoLidas(req.usuarioId);
      res.json({ success: true, data: { total } });
    } catch (err) {
      next(err);
    }
  },

  async marcarComoLida(req, res, next) {
    try {
      await notificacaoService.marcarComoLida(req.params.id, req.usuarioId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  async marcarTodasComoLidas(req, res, next) {
    try {
      await notificacaoService.marcarTodasComoLidas(req.usuarioId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = notificacaoController;
