import api from "./api";

const localService = {
  async listar() {
    const { data } = await api.get("/locais");
    return data.data;
  },

  /** Usado pela tela administrativa de locais/QR Codes. */
  async listarTodos() {
    const { data } = await api.get("/locais/todos");
    return data.data;
  },

  /**
   * Resolve um local a partir do código do QR Code. Rota pública no
   * backend (sem exigir login) — usada tanto em /chamado?local=CODIGO
   * (fluxo sem login) quanto em /chamados/novo/:codigo (autenticado).
   */
  async buscarPorCodigo(codigo) {
    const { data } = await api.get(`/locais/codigo/${codigo}`);
    return data.data;
  },

  async criar(dados) {
    const { data } = await api.post("/locais", dados);
    return data.data;
  },
};

export default localService;
