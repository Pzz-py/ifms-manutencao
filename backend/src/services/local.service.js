const localRepository = require("../repositories/local.repository");
const { gerarCodigoBase } = require("../utils/codigo");
const { AppError } = require("../middlewares/errorHandler");

function serializarLocal(local) {
  return {
    id: local.id,
    nome: local.nome,
    bloco: local.bloco,
    descricao: local.descricao,
    codigo: local.codigo,
    ativo: local.ativo,
  };
}

const localService = {
  /**
   * Gera um código único a partir do nome do local. Em caso de colisão
   * (dois nomes diferentes gerando o mesmo slug), acrescenta um sufixo
   * numérico até encontrar um código livre.
   */
  async gerarCodigoUnico(nome) {
    const base = gerarCodigoBase(nome);
    let codigo = base;
    let sufixo = 1;

    while (await localRepository.buscarPorCodigo(codigo)) {
      sufixo += 1;
      codigo = `${base}-${sufixo}`;
    }

    return codigo;
  },

  async criar({ nome, bloco, descricao }) {
    if (!nome?.trim()) {
      throw new AppError("Informe o nome do local.", 400);
    }

    const jaExiste = await localRepository.buscarPorNome(nome.trim());
    if (jaExiste) {
      throw new AppError("Já existe um local cadastrado com esse nome.", 400);
    }

    const codigo = await this.gerarCodigoUnico(nome.trim());

    const local = await localRepository.criar({
      nome: nome.trim(),
      bloco: bloco?.trim() || null,
      descricao: descricao?.trim() || null,
      codigo,
    });

    return serializarLocal(local);
  },

  async listarTodos() {
    const locais = await localRepository.listarTodos();
    return locais.map(serializarLocal);
  },

  async buscarPorCodigo(codigo) {
    const local = await localRepository.buscarPorCodigo(codigo);

    if (!local || !local.ativo) {
      throw new AppError("Local não encontrado. Verifique o QR Code utilizado.", 404);
    }

    return serializarLocal(local);
  },
};

module.exports = localService;
