import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

/**
 * Envolve rotas que exigem autenticação.
 * - Enquanto a sessão está sendo restaurada (reload da página), mostra um loading.
 * - Sem sessão válida, redireciona para /login guardando a rota de origem
 *   para devolver o usuário ao local certo depois do login.
 */
export default function ProtectedRoute() {
  const { estaAutenticado, carregando } = useAuth();
  const location = useLocation();

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace state={{ de: location.pathname }} />;
  }

  return <Outlet />;
}
