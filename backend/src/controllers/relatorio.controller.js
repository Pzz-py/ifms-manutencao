const relatorioService = require("../services/relatorio.service");

const relatorioController = {
  async consolidado(req, res, next) {
    try {
      const dados = await relatorioService.consolidado(req.query);
      res.json({ success: true, data: dados });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = relatorioController;
