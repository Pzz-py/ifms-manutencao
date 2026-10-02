import { useState } from "react";
import { User, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/Input";
import Button from "../components/Button";
import usuarioService from "../services/usuario.service";
import { getErrorMessage } from "../utils/getErrorMessage";

export default function Perfil() {
  const { usuario, atualizarUsuario } = useAuth();

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h2 className="font-display text-lg font-bold text-neutral-900">Perfil</h2>
        <p className="text-sm text-neutral-500 mt-0.5">
          Gerencie suas informações pessoais e sua senha de acesso.
        </p>
      </div>

      {/* Cabeçalho com avatar */}
      <div className="surface-card p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-xl font-semibold shrink-0">
          {usuario?.nome?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="min-w-0">
          <p className="font-display font-semibold text-neutral-900 truncate">{usuario?.nome}</p>
          <p className="text-sm text-neutral-500 truncate">{usuario?.email}</p>
          <span className="inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700">
            {usuario?.role === "ADMINISTRADOR" ? "Administrador" : "Usuário"}
          </span>
        </div>
      </div>

      <FormularioNome usuario={usuario} atualizarUsuario={atualizarUsuario} />
      <FormularioSenha />
    </div>
  );
}

function FormularioNome({ usuario, atualizarUsuario }) {
  const [nome, setNome] = useState(usuario?.nome || "");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const alterado = nome.trim() !== usuario?.nome;

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso(false);

    if (!nome.trim()) {
      setErro("Informe seu nome.");
      return;
    }

    setEnviando(true);
    try {
      const atualizado = await usuarioService.atualizarPerfil({ nome });
      atualizarUsuario(atualizado);
      setSucesso(true);
      setTimeout(() => setSucesso(false), 4000);
    } catch (err) {
      setErro(getErrorMessage(err, "Não foi possível salvar suas informações."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface-card p-5 space-y-4">
      <h3 className="flex items-center gap-1.5 font-display font-semibold text-sm text-neutral-800">
        <User className="w-4 h-4" /> Informações pessoais
      </h3>

      {erro && (
        <div className="flex items-start gap-2 bg-priority-urgente/10 text-priority-urgente text-sm rounded-lg px-3 py-2.5">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{erro}</span>
        </div>
      )}
      {sucesso && (
        <div className="flex items-center gap-2 bg-primary-50 text-primary-700 text-sm rounded-lg px-3 py-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Informações atualizadas.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="nome" label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Input id="email" label="E-mail" value={usuario?.email || ""} disabled />
      </div>
      <p className="text-xs text-neutral-400 -mt-2">
        O e-mail é usado para login e não pode ser alterado por aqui.
      </p>

      <div className="flex justify-end">
        <Button type="submit" loading={enviando} disabled={!alterado}>
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}

function FormularioSenha() {
  const VALORES_INICIAIS = { senhaAtual: "", novaSenha: "", confirmarSenha: "" };
  const [valores, setValores] = useState(VALORES_INICIAIS);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  function atualizarCampo(campo, valor) {
    setValores((atual) => ({ ...atual, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso(false);

    if (valores.novaSenha.length < 6) {
      setErro("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (valores.novaSenha !== valores.confirmarSenha) {
      setErro("A confirmação não coincide com a nova senha.");
      return;
    }

    setEnviando(true);
    try {
      await usuarioService.alterarSenha({
        senhaAtual: valores.senhaAtual,
        novaSenha: valores.novaSenha,
      });
      setValores(VALORES_INICIAIS);
      setSucesso(true);
      setTimeout(() => setSucesso(false), 4000);
    } catch (err) {
      setErro(getErrorMessage(err, "Não foi possível trocar a senha."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface-card p-5 space-y-4">
      <h3 className="flex items-center gap-1.5 font-display font-semibold text-sm text-neutral-800">
        <Lock className="w-4 h-4" /> Alterar senha
      </h3>

      {erro && (
        <div className="flex items-start gap-2 bg-priority-urgente/10 text-priority-urgente text-sm rounded-lg px-3 py-2.5">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{erro}</span>
        </div>
      )}
      {sucesso && (
        <div className="flex items-center gap-2 bg-primary-50 text-primary-700 text-sm rounded-lg px-3 py-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Senha alterada com sucesso.
        </div>
      )}

      <Input
        id="senhaAtual"
        type="password"
        label="Senha atual"
        autoComplete="current-password"
        value={valores.senhaAtual}
        onChange={(e) => atualizarCampo("senhaAtual", e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="novaSenha"
          type="password"
          label="Nova senha"
          autoComplete="new-password"
          value={valores.novaSenha}
          onChange={(e) => atualizarCampo("novaSenha", e.target.value)}
        />
        <Input
          id="confirmarSenha"
          type="password"
          label="Confirmar nova senha"
          autoComplete="new-password"
          value={valores.confirmarSenha}
          onChange={(e) => atualizarCampo("confirmarSenha", e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          loading={enviando}
          disabled={!valores.senhaAtual || !valores.novaSenha || !valores.confirmarSenha}
        >
          Trocar senha
        </Button>
      </div>
    </form>
  );
}
