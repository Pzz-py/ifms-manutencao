import { useState } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { Mail, Lock, Wrench, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/Input";
import Button from "../components/Button";
import { getErrorMessage } from "../utils/getErrorMessage";

export default function Login() {
  const { login, estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Já autenticado? não faz sentido mostrar a tela de login.
  if (estaAutenticado) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      await login(email, senha);
      const destino = location.state?.de || "/dashboard";
      navigate(destino, { replace: true });
    } catch (err) {
      setErro(getErrorMessage(err, "Não foi possível entrar. Verifique seus dados."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Painel institucional */}
      <div className="hidden lg:flex flex-col justify-between bg-primary-700 text-white p-12 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-primary-600/40" />
        <div className="absolute -left-16 bottom-0 w-72 h-72 rounded-full bg-primary-800/40" />

        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
            <Wrench className="w-4 h-4" />
          </div>
          <span className="font-display font-semibold">Manutenção IFMS</span>
        </div>

        <div className="relative max-w-sm">
          <h2 className="font-display text-3xl font-bold leading-tight mb-3">
            Chamados de manutenção, do jeito certo.
          </h2>
          <p className="text-primary-100 text-sm leading-relaxed">
            Abra, acompanhe e gerencie solicitações de manutenção do Campus
            Jardim em um único lugar — sem planilhas, sem retrabalho.
          </p>
        </div>

        <p className="relative text-xs text-primary-200">
          Instituto Federal de Mato Grosso do Sul — Campus Jardim
        </p>
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold text-neutral-900">
              Manutenção IFMS
            </span>
          </div>

          <h1 className="font-display text-xl font-bold text-neutral-900 mb-1">
            Entrar
          </h1>
          <p className="text-sm text-neutral-500 mb-6">
            Use suas credenciais institucionais para acessar o sistema.
          </p>

          {erro && (
            <div className="flex items-start gap-2 bg-priority-urgente/10 text-priority-urgente text-sm rounded-lg px-3 py-2.5 mb-5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <div className="space-y-4">
            <Input
              id="email"
              type="email"
              label="E-mail"
              icon={Mail}
              placeholder="seuemail@ifms.edu.br"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="senha"
              type="password"
              label="Senha"
              icon={Lock}
              placeholder="••••••••"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <Button type="submit" loading={enviando} className="w-full mt-6">
            Entrar
          </Button>

          {/* O usuário comum não precisa de conta: este é o caminho
              principal para quem só quer comunicar um problema. */}
          <div className="mt-6 pt-5 border-t border-neutral-200 text-center">
            <p className="text-sm text-neutral-500 mb-2">
              Só quer comunicar um problema?
            </p>
            <Link
              to="/chamado"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Abrir chamado sem login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-6 pt-5 border-t border-neutral-200 text-xs text-neutral-400 space-y-1">
            <p className="font-medium text-neutral-500">Contas de teste (administração):</p>
            <p>Administrador: admin@ifms.edu.br / admin123</p>
            <p>Usuário: aluno@ifms.edu.br / usuario123</p>
          </div>
        </form>
      </div>
    </div>
  );
}
