const { Router } = require("express");

const router = Router();

/**
 * GET /api/health
 * Rota simples para verificar se a API está de pé.
 * Útil durante o desenvolvimento e para o frontend confirmar
 * a conexão antes de tentar autenticar.
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API do sistema de chamados está funcionando.",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
