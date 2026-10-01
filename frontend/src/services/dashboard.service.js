import api from "./api";

const dashboardService = {
  async obterResumo() {
    const { data } = await api.get("/dashboard/resumo");
    return data.data;
  },
};

export default dashboardService;
