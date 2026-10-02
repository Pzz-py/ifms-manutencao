const dashboardService = require("../services/dashboard.service");

const dashboardController = {
  async resumo(req, res, next) {
    try {
      const dados = await dashboardService.obterResumo();
      res.json({ success: true, data: dados });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = dashboardController;
