import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

/**
 * Esqueleto usado por todas as telas autenticadas.
 * As páginas em si (Dashboard, Chamados, etc.) são renderizadas
 * dentro de <Outlet /> pelo react-router.
 *
 * Em telas pequenas a Sidebar vira um menu retrátil (drawer): o estado
 * de aberto/fechado mora aqui porque é compartilhado entre o botão de
 * menu (Topbar) e o próprio painel (Sidebar).
 */
export default function AppLayout() {
  const [menuAberto, setMenuAberto] = useState(false);
  const location = useLocation();

  // Fecha o menu mobile automaticamente sempre que a rota muda.
  useEffect(() => {
    setMenuAberto(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar aberta={menuAberto} aoFechar={() => setMenuAberto(false)} />
      <div className="flex-1 min-w-0">
        <Topbar aoAbrirMenu={() => setMenuAberto(true)} />
        <main className="p-4 sm:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
