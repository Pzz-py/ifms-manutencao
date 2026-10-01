const { Router } = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const dashboardRoutes = require("./dashboard.routes");
const chamadoRoutes = require("./chamado.routes");
const localRoutes = require("./local.routes");
const usuarioRoutes = require("./usuario.routes");
const notificacaoRoutes = require("./notificacao.routes");
const relatorioRoutes = require("./relatorio.routes");
const { categoriaChamadoRoutes, categoriaMaterialRoutes } = require("./categoria.routes");

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/chamados", chamadoRoutes);
router.use("/locais", localRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/notificacoes", notificacaoRoutes);
router.use("/relatorios", relatorioRoutes);
router.use("/categorias-chamado", categoriaChamadoRoutes);
router.use("/categorias-material", categoriaMaterialRoutes);

module.exports = router;
