const { Router } = require("express");
const controller = require("../controllers/materialCatalogo.controller");
const { autenticar, autorizar } = require("../middlewares/auth.middleware");
const { ROLES } = require("../utils/constants");

const router = Router();
const admin = [autenticar, autorizar(ROLES.ADMINISTRADOR)];

// Catálogo de materiais — tudo restrito ao ADMINISTRADOR.
router.get("/", ...admin, controller.listar);
router.post("/", ...admin, controller.criar);
router.patch("/:id", ...admin, controller.atualizar);
router.delete("/:id", ...admin, controller.remover);

module.exports = router;
