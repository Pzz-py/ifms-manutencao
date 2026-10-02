import axios from "axios";

/**
 * Instância central do axios.
 * baseURL "/api" funciona tanto em desenvolvimento (proxy do Vite,
 * ver vite.config.js) quanto em produção, caso frontend e backend
 * sejam servidos sob o mesmo domínio.
 */
const api = axios.create({
  baseURL: "/api",
});

// Anexa o token JWT (se existir) em toda requisição.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ifms:token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se o token expirar/for inválido, limpa a sessão local.
// O redirecionamento para /login é feito pelo AuthContext, que escuta
// este evento — assim o api.js não depende do react-router diretamente.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ifms:token");
      window.dispatchEvent(new Event("ifms:sessao-expirada"));
    }
    return Promise.reject(error);
  }
);

export default api;
