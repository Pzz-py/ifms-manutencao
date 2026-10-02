const localRepository = require("../repositories/local.repository");
const localService = require("../services/local.service");

const localController = {
  async listar(req, res, next) {
    try {
      const locais = await localRepository.listarAtivos();
      res.json({ success: true, data: locais });
    } catch (err) {
      next(err);
    }
  },

  async listarTodos(req, res, next) {
    try {
      const locais = await localService.listarTodos();
      res.json({ success: true, data: locais });
    } catch (err) {
      next(err);
    }
  },

  async buscarPorCodigo(req, res, next) {
    try {
      const local = await localService.buscarPorCodigo(req.params.codigo);
      res.json({ success: true, data: local });
    } catch (err) {
      next(err);
    }
  },

  async criar(req, res, next) {
    try {
      const local = await localService.criar(req.body);
      res.status(201).json({ success: true, data: local });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = localController;
