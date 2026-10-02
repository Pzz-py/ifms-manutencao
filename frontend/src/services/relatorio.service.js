import api from "./api";

const relatorioService = {
  async consolidado(periodo) {
    const { data } = await api.get("/relatorios/consolidado", { params: periodo });
    return data.data;
  },
};

export default relatorioService;
