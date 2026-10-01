import api from "./api";

const usuarioService = {
  async listarAdministradores() {
    const { data } = await api.get("/usuarios/administradores");
    return data.data;
  },

  async atualizarPerfil(dados) {
    const { data } = await api.patch("/usuarios/me", dados);
    return data.data;
  },

  async alterarSenha(dados) {
    await api.patch("/usuarios/me/senha", dados);
  },
};

export default usuarioService;
