import api from "./api";

const notificacaoService = {
  async listar(apenasNaoLidas = false) {
    const { data } = await api.get("/notificacoes", { params: { apenasNaoLidas } });
    return data.data;
  },

  async contarNaoLidas() {
    const { data } = await api.get("/notificacoes/nao-lidas/contagem");
    return data.data.total;
  },

  async marcarComoLida(id) {
    await api.patch(`/notificacoes/${id}/lida`);
  },

  async marcarTodasComoLidas() {
    await api.patch("/notificacoes/lidas");
  },
};

export default notificacaoService;
