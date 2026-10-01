import api from "./api";

const authService = {
  async login(email, senha) {
    const { data } = await api.post("/auth/login", { email, senha });
    return data.data; // { usuario, token }
  },

  async buscarUsuarioLogado() {
    const { data } = await api.get("/auth/me");
    return data.data; // usuario
  },
};

export default authService;
