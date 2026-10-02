const chamadoService = require("../services/chamado.service");

const chamadoController = {
  async criar(req, res, next) {
    try {
      const chamado = await chamadoService.criar(
        { ...req.body, arquivo: req.file },
        req.usuarioId
      );
      res.status(201).json({ success: true, data: chamado });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Abertura pública (sem login) — usada pelo fluxo do QR Code.
   * O IP é capturado aqui (camada HTTP) e repassado ao service apenas
   * para fins de auditoria básica, sem coletar mais nenhum dado técnico.
   */
  async criarPublico(req, res, next) {
    try {
      const chamado = await chamadoService.criarPublico(
        { ...req.body, arquivo: req.file },
        req.ip
      );
      res.status(201).json({ success: true, data: chamado });
    } catch (err) {
      next(err);
    }
  },

  async listar(req, res, next) {
    try {
      const resultado = await chamadoService.listar(req.query, {
        id: req.usuarioId,
        role: req.usuarioRole,
      });
      res.json({ success: true, data: resultado });
    } catch (err) {
      next(err);
    }
  },

  async detalhes(req, res, next) {
    try {
      const chamado = await chamadoService.buscarPorId(req.params.id, {
        id: req.usuarioId,
        role: req.usuarioRole,
      });
      res.json({ success: true, data: chamado });
    } catch (err) {
      next(err);
    }
  },

  async atualizar(req, res, next) {
    try {
      const chamado = await chamadoService.atualizar(req.params.id, req.body, req.usuarioId);
      res.json({ success: true, data: chamado });
    } catch (err) {
      next(err);
    }
  },

  async adicionarObservacao(req, res, next) {
    try {
      const chamado = await chamadoService.adicionarObservacao(
        req.params.id,
        req.body.texto,
        req.usuarioId
      );
      res.status(201).json({ success: true, data: chamado });
    } catch (err) {
      next(err);
    }
  },

  async adicionarMaterial(req, res, next) {
    try {
      const chamado = await chamadoService.adicionarMaterial(req.params.id, req.body, req.usuarioId);
      res.status(201).json({ success: true, data: chamado });
    } catch (err) {
      next(err);
    }
  },

  async atualizarMaterial(req, res, next) {
    try {
      const chamado = await chamadoService.atualizarMaterial(
        req.params.id,
        req.params.materialId,
        req.body
      );
      res.json({ success: true, data: chamado });
    } catch (err) {
      next(err);
    }
  },

  async removerMaterial(req, res, next) {
    try {
      const chamado = await chamadoService.removerMaterial(req.params.id, req.params.materialId);
      res.json({ success: true, data: chamado });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = chamadoController;
