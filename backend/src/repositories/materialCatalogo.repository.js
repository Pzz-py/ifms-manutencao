const prisma = require("../config/database");

const materialCatalogoRepository = {
  listar: () => prisma.materialCatalogo.findMany({ orderBy: { nome: "asc" } }),
  buscarPorId: (id) => prisma.materialCatalogo.findUnique({ where: { id } }),
  criar: (data) => prisma.materialCatalogo.create({ data }),
  atualizar: (id, data) => prisma.materialCatalogo.update({ where: { id }, data }),

  // Quantos registros de uso (em chamados) cada item do catálogo tem.
  // Retorna { [catalogoId]: quantidade }.
  async contarUso() {
    const grupos = await prisma.material.groupBy({ by: ["catalogoId"], _count: true });
    return Object.fromEntries(grupos.filter((g) => g.catalogoId).map((g) => [g.catalogoId, g._count]));
  },

  // Renomear no catálogo atualiza também a cópia do nome nos registros de
  // uso, para que chamados e relatórios mostrem sempre o nome atual.
  renomear: (id, nome, unidade) =>
    prisma.$transaction([
      prisma.materialCatalogo.update({ where: { id }, data: { nome, unidade } }),
      prisma.material.updateMany({ where: { catalogoId: id }, data: { nome } }),
    ]),

  // Remover o item NÃO apaga o histórico: os registros de uso mantêm o
  // nome (cópia) e apenas perdem o vínculo com o catálogo.
  remover: (id) =>
    prisma.$transaction([
      prisma.material.updateMany({ where: { catalogoId: id }, data: { catalogoId: null } }),
      prisma.materialCatalogo.delete({ where: { id } }),
    ]),
};

module.exports = materialCatalogoRepository;
