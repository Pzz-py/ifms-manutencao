const { Router } = require("express");
const notificacaoController = require("../controllers/notificacao.controller");
const { autenticar } = require("../middlewares/auth.middleware");

const router = Router();

// GET /api/notificacoes?apenasNaoLidas=true
router.get("/", autenticar, notificacaoController.listar);

// GET /api/notificacoes/nao-lidas/contagem
router.get("/nao-lidas/contagem", autenticar, notificacaoController.contarNaoLidas);

// PATCH /api/notificacoes/lidas — marca todas como lidas
router.patch("/lidas", autenticar, notificacaoController.marcarTodasComoLidas);

// PATCH /api/notificacoes/:id/lida — marca uma notificação como lida
router.patch("/:id/lida", autenticar, notificacaoController.marcarComoLida);

module.exports = router;
