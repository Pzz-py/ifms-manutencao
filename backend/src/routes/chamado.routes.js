const { Router } = require("express");
const chamadoController = require("../controllers/chamado.controller");
const { autenticar, autorizar } = require("../middlewares/auth.middleware");
const { receberImagemOpcional } = require("../middlewares/upload.middleware");
const { ROLES } = require("../utils/constants");

const router = Router();

// GET /api/chamados — lista chamados (com filtros/busca/paginação).
// Usuário comum só vê os próprios chamados; administrador vê todos.
router.get("/", autenticar, chamadoController.listar);

// POST /api/chamados — abre um novo chamado. Aceita multipart/form-data
// com um campo opcional "imagem" (foto do problema).
router.post("/", autenticar, receberImagemOpcional, chamadoController.criar);

// POST /api/chamados/publico — abre um chamado SEM login (fluxo do QR
// Code). Não passa por `autenticar` de propósito: é o único jeito de um
// aluno/professor comunicar um problema sem precisar de conta.
router.post("/publico", receberImagemOpcional, chamadoController.criarPublico);

// GET /api/chamados/:id — detalhes completos (histórico, observações, anexos).
// Usuário comum só pode ver o próprio chamado (checado no service).
router.get("/:id", autenticar, chamadoController.detalhes);

// PATCH /api/chamados/:id — altera status/prioridade/responsável. Admin only.
router.patch("/:id", autenticar, autorizar(ROLES.ADMINISTRADOR), chamadoController.atualizar);

// POST /api/chamados/:id/observacoes — adiciona uma observação. Admin only.
router.post(
  "/:id/observacoes",
  autenticar,
  autorizar(ROLES.ADMINISTRADOR),
  chamadoController.adicionarObservacao
);

// Materiais necessários/utilizados na manutenção. Admin only por enquanto
// (o papel de Técnico ainda não foi implementado — ver README).
router.post(
  "/:id/materiais",
  autenticar,
  autorizar(ROLES.ADMINISTRADOR),
  chamadoController.adicionarMaterial
);
router.patch(
  "/:id/materiais/:materialId",
  autenticar,
  autorizar(ROLES.ADMINISTRADOR),
  chamadoController.atualizarMaterial
);
router.delete(
  "/:id/materiais/:materialId",
  autenticar,
  autorizar(ROLES.ADMINISTRADOR),
  chamadoController.removerMaterial
);

module.exports = router;
