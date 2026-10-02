const { Router } = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const { autenticar } = require("../middlewares/auth.middleware");

const router = Router();

// GET /api/dashboard/resumo — indicadores, distribuições, recentes e atividades
router.get("/resumo", autenticar, dashboardController.resumo);

module.exports = router;
