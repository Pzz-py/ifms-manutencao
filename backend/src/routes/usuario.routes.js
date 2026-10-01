const { Router } = require("express");
const usuarioController = require("../controllers/usuario.controller");
const { autenticar, autorizar } = require("../middlewares/auth.middleware");
const { ROLES } = require("../utils/constants");

const router = Router();

// GET /api/usuarios/administradores — usado no select de "Responsável" (Etapa 5)
router.get(
  "/administradores",
  autenticar,
  autorizar(ROLES.ADMINISTRADOR),
  usuarioController.listarAdministradores
);

// PATCH /api/usuarios/me — atualiza o próprio nome
router.patch("/me", autenticar, usuarioController.atualizarPerfil);

// PATCH /api/usuarios/me/senha — troca a própria senha
router.patch("/me/senha", autenticar, usuarioController.alterarSenha);

module.exports = router;
