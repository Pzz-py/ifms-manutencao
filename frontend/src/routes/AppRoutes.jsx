import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../layouts/AppLayout";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ChamadosLista from "../pages/ChamadosLista";
import NovoChamado from "../pages/NovoChamado";
import ChamadoDetalhes from "../pages/ChamadoDetalhes";
import LocaisAdmin from "../pages/LocaisAdmin";
import Relatorios from "../pages/Relatorios";
import CategoriasChamado from "../pages/CategoriasChamado";
import Materiais from "../pages/Materiais";
import Perfil from "../pages/Perfil";
import Configuracoes from "../pages/Configuracoes";
import AbrirChamadoPublico from "../pages/AbrirChamadoPublico";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rota PÚBLICA — sem login, de propósito. É para onde os QR Codes
          fixados no campus apontam (?local=CODIGO identifica o ambiente). */}
      <Route path="/chamado" element={<AbrirChamadoPublico />} />

      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chamados" element={<ChamadosLista />} />
          <Route path="/chamados/novo" element={<NovoChamado />} />
          {/* Abertura autenticada (equivalente ao fluxo público, mas para
              quem está logado e quer o chamado vinculado à própria conta) */}
          <Route path="/chamados/novo/:codigo" element={<NovoChamado />} />
          <Route path="/chamados/:id" element={<ChamadoDetalhes />} />
          <Route path="/locais" element={<LocaisAdmin />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/categorias-chamado" element={<CategoriasChamado />} />
          <Route path="/materiais" element={<Materiais />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
      </Route>

      {/* A raiz leva à abertura de chamado sem login: é o caminho do
          usuário comum, que é a maioria. A administração entra por /login. */}
      <Route path="/" element={<Navigate to="/chamado" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
