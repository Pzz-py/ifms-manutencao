const prisma = require("../config/database");

/**
 * Repositório genérico para as tabelas de categoria (chamado e material).
 * As duas têm o mesmo formato básico (id, nome, ativo), então compartilham
 * a implementação; `contarUso` é específico de cada uma.
 */
function criarRepositorioCategoria(model, contarUso) {
  return {
    listar: () => prisma[model].findMany({ orderBy: { nome: "asc" } }),
    contar: () => prisma[model].count(),
    buscarPorId: (id) => prisma[model].findUnique({ where: { id } }),
    criar: (data) => prisma[model].create({ data }),
    // Loop em transação (evita depender de createMany em SQLite).
    criarVarios: (lista) => prisma.$transaction(lista.map((data) => prisma[model].create({ data }))),
    atualizar: (id, data) => prisma[model].update({ where: { id }, data }),
    remover: (id) => prisma[model].delete({ where: { id } }),
    contarUso,
  };
}

// Chamados guardam o `codigo` da categoria em texto (sem FK). Retorna
// { [codigo]: quantidade de chamados }.
async function usoCategoriaChamado() {
  const grupos = await prisma.chamado.groupBy({ by: ["categoria"], _count: true });
  return Object.fromEntries(grupos.map((g) => [g.categoria, g._count]));
}

module.exports = {
  categoriaChamadoRepository: criarRepositorioCategoria("categoriaChamado", usoCategoriaChamado),
};
