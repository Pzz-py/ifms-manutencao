const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const { autenticar } = require("../middlewares/auth.middleware");

const router = Router();

// POST /api/auth/login — autentica o usuário e devolve o token JWT
router.post("/login", authController.login);

// GET /api/auth/me — devolve os dados do usuário autenticado
// (usado pelo frontend para restaurar a sessão ao recarregar a página)
router.get("/me", autenticar, authController.me);

module.exports = router;
