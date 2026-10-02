import api from "./api";

const materialCatalogoService = {
  async listar() {
    const { data } = await api.get("/materiais");
    return data.data;
  },
  async criar(dados) {
    const { data } = await api.post("/materiais", dados);
    return data.data;
  },
  async atualizar(id, dados) {
    const { data } = await api.patch(`/materiais/${id}`, dados);
    return data.data;
  },
  async remover(id) {
    await api.delete(`/materiais/${id}`);
  },
};

export default materialCatalogoService;
