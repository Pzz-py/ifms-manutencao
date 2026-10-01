const { Router } = require("express");
const relatorioController = require("../controllers/relatorio.controller");
const { autenticar, autorizar } = require("../middlewares/auth.middleware");
const { ROLES } = require("../utils/constants");

const router = Router();

// GET /api/relatorios/consolidado?dataInicio=YYYY-MM-DD&dataFim=YYYY-MM-DD
// Relatório gerencial de toda a manutenção no período.
router.get(
  "/consolidado",
  autenticar,
  autorizar(ROLES.ADMINISTRADOR),
  relatorioController.consolidado
);

module.exports = router;
