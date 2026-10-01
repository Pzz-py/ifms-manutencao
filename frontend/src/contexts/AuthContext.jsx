import { createContext, useCallback, useEffect, useState } from "react";
import authService from "../services/auth.service";

export const AuthContext = createContext(null);

const TOKEN_KEY = "ifms:token";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  // "carregando" só na inicialização (restaurando sessão a partir do token salvo)
  const [carregando, setCarregando] = useState(true);

  const limparSessao = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUsuario(null);
  }, []);

  // Ao montar a aplicação, tenta restaurar a sessão a partir do token salvo.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setCarregando(false);
      return;
    }

    authService
      .buscarUsuarioLogado()
      .then((usuarioLogado) => setUsuario(usuarioLogado))
      .catch(() => limparSessao())
      .finally(() => setCarregando(false));
  }, [limparSessao]);

  // Reage a expiração de sessão disparada pelo interceptor do axios (api.js).
  useEffect(() => {
    function aoExpirarSessao() {
      setUsuario(null);
    }
    window.addEventListener("ifms:sessao-expirada", aoExpirarSessao);
    return () => window.removeEventListener("ifms:sessao-expirada", aoExpirarSessao);
  }, []);

  async function login(email, senha) {
    const { usuario: usuarioLogado, token } = await authService.login(email, senha);
    localStorage.setItem(TOKEN_KEY, token);
    setUsuario(usuarioLogado);
    return usuarioLogado;
  }

  function logout() {
    limparSessao();
  }

  /** Atualiza o usuário em memória (ex: após editar o nome no Perfil), sem precisar recarregar a sessão. */
  function atualizarUsuario(dadosParciais) {
    setUsuario((atual) => ({ ...atual, ...dadosParciais }));
  }

  const value = {
    usuario,
    estaAutenticado: !!usuario,
    carregando,
    login,
    logout,
    atualizarUsuario,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
