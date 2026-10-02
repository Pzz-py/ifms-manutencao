import api from "./api";

/** Cliente genérico das rotas de categoria (chamado e material). */
function criarServicoCategoria(base) {
  return {
    async listar() {
      const { data } = await api.get(base);
      return data.data;
    },
    async listarGestao() {
      const { data } = await api.get(`${base}/gestao`);
      return data.data;
    },
    async criar(dados) {
      const { data } = await api.post(base, dados);
      return data.data;
    },
    async atualizar(id, dados) {
      const { data } = await api.patch(`${base}/${id}`, dados);
      return data.data;
    },
    async remover(id) {
      await api.delete(`${base}/${id}`);
    },
  };
}

export const categoriaChamadoService = criarServicoCategoria("/categorias-chamado");
