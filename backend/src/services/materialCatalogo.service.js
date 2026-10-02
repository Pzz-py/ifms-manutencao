const repo = require("../repositories/materialCatalogo.repository");
const { AppError } = require("../middlewares/errorHandler");
const { normalizar, validarNome } = require("../utils/texto");

function limparUnidade(unidade) {
  const u = (unidade || "").trim();
  if (u.length > 10) throw new AppError("A unidade deve ter no máximo 10 caracteres (ex: un, m, kg, L).", 400);
  return u || null;
}

function serializar(item, emUso) {
  return {
    id: item.id,
    nome: item.nome,
    unidade: item.unidade,
    ...(emUso !== undefined ? { emUso } : {}),
  };
}

async function garantirNomeUnico(nome, ignorarId) {
  const alvo = normalizar(nome);
  const todos = await repo.listar();
  if (todos.some((m) => m.id !== ignorarId && normalizar(m.nome) === alvo)) {
    throw new AppError("Já existe um material com esse nome.", 409);
  }
}

const materialCatalogoService = {
  async listar() {
    const [itens, uso] = await Promise.all([repo.listar(), repo.contarUso()]);
    return itens.map((m) => serializar(m, uso[m.id] || 0));
  },

  async criar({ nome, unidade }) {
    const limpo = validarNome(nome, 80);
    const un = limparUnidade(unidade);
    await garantirNomeUnico(limpo);
    return serializar(await repo.criar({ nome: limpo, unidade: un }));
  },

  async atualizar(id, { nome, unidade }) {
    const atual = await repo.buscarPorId(id);
    if (!atual) throw new AppError("Material não encontrado.", 404);

    const novoNome = nome !== undefined ? validarNome(nome, 80) : atual.nome;
    const novaUnidade = unidade !== undefined ? limparUnidade(unidade) : atual.unidade;
    if (nome === undefined && unidade === undefined) throw new AppError("Nenhuma alteração informada.", 400);

    await garantirNomeUnico(novoNome, id);
    await repo.renomear(id, novoNome, novaUnidade);
    return serializar({ ...atual, nome: novoNome, unidade: novaUnidade });
  },

  async remover(id) {
    const atual = await repo.buscarPorId(id);
    if (!atual) throw new AppError("Material não encontrado.", 404);
    await repo.remover(id);
  },
};

module.exports = materialCatalogoService;
