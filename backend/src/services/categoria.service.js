const { categoriaChamadoRepository } = require("../repositories/categoria.repository");
const { AppError } = require("../middlewares/errorHandler");
const { gerarCodigoBase } = require("../utils/codigo");
const { CATEGORIA_LABELS } = require("../utils/categoriaLabels");
const { normalizar, validarNome } = require("../utils/texto");

function serializar(item, emUso) {
  return {
    id: item.id,
    nome: item.nome,
    ...(item.codigo !== undefined ? { codigo: item.codigo } : {}),
    ativo: item.ativo,
    ...(emUso !== undefined ? { emUso } : {}),
  };
}

/**
 * Serviço genérico de gestão de categorias (chamado e material).
 * - `usaCodigo`: categorias de chamado têm um código imutável usado em
 *   Chamado.categoria; o nome pode mudar sem afetar chamados antigos.
 * - `chaveUso`: como achar, no mapa de uso, a contagem de um item.
 */
function criarServicoCategoria({ repo, entidade, usaCodigo, chaveUso, padroes }) {
  async function garantirNomeUnico(nome, ignorarId) {
    const todos = await repo.listar();
    const alvo = normalizar(nome);
    if (todos.some((c) => c.id !== ignorarId && normalizar(c.nome) === alvo)) {
      throw new AppError(`Já existe ${entidade} com esse nome.`, 409);
    }
    return todos;
  }

  return {
    async listar() {
      return (await repo.listar()).map((c) => serializar(c));
    },

    async listarGestao() {
      const [itens, uso] = await Promise.all([repo.listar(), repo.contarUso()]);
      return itens.map((c) => serializar(c, uso[chaveUso(c)] || 0));
    },

    async criar({ nome }) {
      const limpo = validarNome(nome);
      const todos = await garantirNomeUnico(limpo);

      const data = { nome: limpo };
      if (usaCodigo) {
        const base = gerarCodigoBase(limpo) || "CATEGORIA";
        const usados = new Set(todos.map((c) => c.codigo));
        let codigo = base;
        for (let n = 2; usados.has(codigo); n += 1) codigo = `${base}-${n}`;
        data.codigo = codigo;
      }
      return serializar(await repo.criar(data));
    },

    async atualizar(id, { nome, ativo }) {
      const atual = await repo.buscarPorId(id);
      if (!atual) throw new AppError(`${entidade} não encontrada.`, 404);

      const data = {};
      if (nome !== undefined) {
        data.nome = validarNome(nome);
        await garantirNomeUnico(data.nome, id);
      }
      if (ativo !== undefined) data.ativo = Boolean(ativo);
      if (Object.keys(data).length === 0) throw new AppError("Nenhuma alteração informada.", 400);

      return serializar(await repo.atualizar(id, data));
    },

    async remover(id) {
      const atual = await repo.buscarPorId(id);
      if (!atual) throw new AppError(`${entidade} não encontrada.`, 404);

      const uso = (await repo.contarUso())[chaveUso(atual)] || 0;
      if (uso > 0) {
        throw new AppError(
          `Não é possível excluir: esta categoria está vinculada a ${uso} registro(s). Desative-a em vez de excluir.`,
          409
        );
      }
      await repo.remover(id);
    },

    /** Cria as categorias iniciais só se a tabela estiver vazia (nunca sobrescreve edições). */
    async garantirPadroes() {
      if ((await repo.contar()) > 0) return false;
      await repo.criarVarios(padroes());
      return true;
    },
  };
}

const categoriaChamadoService = criarServicoCategoria({
  repo: categoriaChamadoRepository,
  entidade: "uma categoria de chamado",
  usaCodigo: true,
  chaveUso: (c) => c.codigo,
  padroes: () => Object.entries(CATEGORIA_LABELS).map(([codigo, nome]) => ({ codigo, nome })),
});

module.exports = { categoriaChamadoService };
