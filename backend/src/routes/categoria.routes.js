const { Router } = require("express");
const { criarControllerCategoria } = require("../controllers/categoria.controller");
const { autenticar, autorizar } = require("../middlewares/auth.middleware");
const { ROLES } = require("../utils/constants");
const { categoriaChamadoService } = require("../services/categoria.service");

/**
 * Rotas de gestão de categorias. Escrita e listagem de gestão: só
 * ADMINISTRADOR. `listagemPublica` libera apenas o GET "/" — usado pelo
 * formulário de abertura de chamado (que funciona sem login).
 */
function criarRotasCategoria(service, { listagemPublica }) {
  const router = Router();
  const controller = criarControllerCategoria(service);
  const admin = [autenticar, autorizar(ROLES.ADMINISTRADOR)];

  router.get("/", ...(listagemPublica ? [] : admin), controller.listar);
  router.get("/gestao", ...admin, controller.listarGestao);
  router.post("/", ...admin, controller.criar);
  router.patch("/:id", ...admin, controller.atualizar);
  router.delete("/:id", ...admin, controller.remover);

  return router;
}

module.exports = {
  categoriaChamadoRoutes: criarRotasCategoria(categoriaChamadoService, { listagemPublica: true }),
};
