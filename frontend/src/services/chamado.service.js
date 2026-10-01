import api from "./api";

const chamadoService = {
  async criar(dados) {
    const formData = new FormData();
    formData.append("titulo", dados.titulo);
    formData.append("descricao", dados.descricao);
    formData.append("categoria", dados.categoria);
    formData.append("prioridade", dados.prioridade);
    formData.append("localId", dados.localId);
    if (dados.imagem) {
      formData.append("imagem", dados.imagem);
    }

    const { data } = await api.post("/chamados", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  /**
   * Abertura pública (sem login) — usada pelo fluxo do QR Code.
   * Não define prioridade (a administração define depois) nem título
   * (gerado automaticamente no backend a partir da categoria + local).
   */
  async criarPublico(dados) {
    const formData = new FormData();
    formData.append("descricao", dados.descricao);
    formData.append("categoria", dados.categoria);
    formData.append("localCodigo", dados.localCodigo);
    if (dados.nome) formData.append("nome", dados.nome);
    if (dados.contato) formData.append("contato", dados.contato);
    if (dados.imagem) formData.append("imagem", dados.imagem);

    const { data } = await api.post("/chamados/publico", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  async listar(filtros) {
    const { data } = await api.get("/chamados", { params: filtros });
    return data.data; // { itens, paginacao }
  },

  async buscarPorId(id) {
    const { data } = await api.get(`/chamados/${id}`);
    return data.data;
  },

  /** Atualização parcial (admin): { status?, prioridade?, responsavelId? } */
  async atualizar(id, dados) {
    const { data } = await api.patch(`/chamados/${id}`, dados);
    return data.data;
  },

  async adicionarObservacao(id, texto) {
    const { data } = await api.post(`/chamados/${id}/observacoes`, { texto });
    return data.data;
  },

  async adicionarMaterial(chamadoId, dados) {
    const { data } = await api.post(`/chamados/${chamadoId}/materiais`, dados);
    return data.data;
  },

  async atualizarMaterial(chamadoId, materialId, dados) {
    const { data } = await api.patch(`/chamados/${chamadoId}/materiais/${materialId}`, dados);
    return data.data;
  },

  async removerMaterial(chamadoId, materialId) {
    const { data } = await api.delete(`/chamados/${chamadoId}/materiais/${materialId}`);
    return data.data;
  },
};

export default chamadoService;
