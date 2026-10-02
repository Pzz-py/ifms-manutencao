const { Router } = require("express");
const localController = require("../controllers/local.controller");
const { autenticar, autorizar } = require("../middlewares/auth.middleware");
const { ROLES } = require("../utils/constants");

const router = Router();

// GET /api/locais — lista os ambientes ativos do campus (usado no select de "Novo chamado")
// Rota PÚBLICA: o formulário de abertura de chamado sem login precisa
// listar os ambientes para quem acessa sem escanear um QR Code.
// São apenas nomes de salas do campus — nada sensível.
router.get("/", localController.listar);

// GET /api/locais/todos — lista todos os locais (inclusive inativos), com código e bloco.
// Usado pela tela administrativa de cadastro/QR Codes.
router.get("/todos", autenticar, autorizar(ROLES.ADMINISTRADOR), localController.listarTodos);

// GET /api/locais/codigo/:codigo — resolve um local a partir do código do QR Code.
// Rota PÚBLICA de propósito: é o primeiro passo do fluxo de abertura de
// chamado sem login (/chamado?local=CODIGO no frontend).
router.get("/codigo/:codigo", localController.buscarPorCodigo);

// POST /api/locais — cadastra um novo local (gera o código do QR Code automaticamente).
router.post("/", autenticar, autorizar(ROLES.ADMINISTRADOR), localController.criar);

module.exports = router;
