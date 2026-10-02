import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Power,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Input from "./Input";
import Button from "./Button";
import ConfirmDialog from "./ConfirmDialog";
import { getErrorMessage } from "../utils/getErrorMessage";

/**
 * Tela genérica de gestão de categorias (chamados e materiais): listar,
 * criar, renomear, ativar/desativar e excluir (só se não estiver em uso).
 * Tudo vai para a API — `service` é o cliente de /categorias-*.
 */
export default function GestaoCategorias({ titulo, descricao, placeholder, rotuloUso, service }) {
  const { usuario } = useAuth();
  const ehAdministrador = usuario?.role === "ADMINISTRADOR";

  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState("");

  const [novoNome, setNovoNome] = useState("");
  const [criando, setCriando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [nomeEdicao, setNomeEdicao] = useState("");
  const [salvandoId, setSalvandoId] = useState(null);

  const [confirmacao, setConfirmacao] = useState(null); // { tipo, item }
  const [processando, setProcessando] = useState(false);

  const [mensagem, setMensagem] = useState(null); // { tipo: "sucesso"|"erro", texto }

  const avisar = (tipo, texto) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem(null), 5000);
  };

  const carregar = useCallback(async () => {
    setErroLista("");
    try {
      setItens(await service.listarGestao());
    } catch (err) {
      setErroLista(getErrorMessage(err, "Não foi possível carregar as categorias."));
    } finally {
      setCarregando(false);
    }
  }, [service]);

  useEffect(() => {
    if (ehAdministrador) carregar();
  }, [ehAdministrador, carregar]);

  if (!ehAdministrador) {
    return (
      <div className="surface-card p-8 max-w-lg flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-priority-urgente/10 text-priority-urgente flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-neutral-900 mb-1">Acesso restrito</h2>
          <p className="text-sm text-neutral-500">Somente administradores podem gerir categorias.</p>
        </div>
      </div>
    );
  }

  async function handleCriar(e) {
    e.preventDefault();
    setErroForm("");
    if (novoNome.trim().length < 2) {
      setErroForm("Informe um nome com pelo menos 2 caracteres.");
      return;
    }
    setCriando(true);
    try {
      await service.criar({ nome: novoNome });
      setNovoNome("");
      await carregar();
      avisar("sucesso", "Categoria criada.");
    } catch (err) {
      setErroForm(getErrorMessage(err, "Não foi possível criar a categoria."));
    } finally {
      setCriando(false);
    }
  }

  async function salvarEdicao(item) {
    if (nomeEdicao.trim().length < 2) {
      avisar("erro", "Informe um nome com pelo menos 2 caracteres.");
      return;
    }
    setSalvandoId(item.id);
    try {
      await service.atualizar(item.id, { nome: nomeEdicao });
      setEditandoId(null);
      await carregar();
      avisar("sucesso", "Categoria atualizada.");
    } catch (err) {
      avisar("erro", getErrorMessage(err, "Não foi possível salvar."));
    } finally {
      setSalvandoId(null);
    }
  }

  async function executarConfirmacao() {
    const { tipo, item } = confirmacao;
    setProcessando(true);
    try {
      if (tipo === "excluir") {
        await service.remover(item.id);
        avisar("sucesso", "Categoria excluída.");
      } else {
        await service.atualizar(item.id, { ativo: tipo === "ativar" });
        avisar("sucesso", tipo === "ativar" ? "Categoria ativada." : "Categoria desativada.");
      }
      setConfirmacao(null);
      await carregar();
    } catch (err) {
      setConfirmacao(null);
      avisar("erro", getErrorMessage(err, "Não foi possível concluir a ação."));
    } finally {
      setProcessando(false);
    }
  }

  const textosConfirmacao = confirmacao && {
    excluir: {
      titulo: "Excluir categoria?",
      mensagem: `"${confirmacao.item.nome}" será removida definitivamente. Esta ação não pode ser desfeita.`,
      label: "Excluir",
      perigo: true,
    },
    desativar: {
      titulo: "Desativar categoria?",
      mensagem: `"${confirmacao.item.nome}" deixará de aparecer para novos registros. O que já foi registrado com ela é preservado.`,
      label: "Desativar",
      perigo: false,
    },
    ativar: {
      titulo: "Ativar categoria?",
      mensagem: `"${confirmacao.item.nome}" voltará a aparecer para novos registros.`,
      label: "Ativar",
      perigo: false,
    },
  }[confirmacao.tipo];

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h2 className="font-display text-lg font-bold text-neutral-900">{titulo}</h2>
        <p className="text-sm text-neutral-500 mt-0.5">{descricao}</p>
      </div>

      {mensagem && (
        <div
          className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2.5 ${
            mensagem.tipo === "sucesso"
              ? "bg-primary-50 text-primary-700"
              : "bg-priority-urgente/10 text-priority-urgente"
          }`}
        >
          {mensagem.tipo === "sucesso" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleCriar} className="surface-card p-5">
        <h3 className="font-display font-semibold text-sm text-neutral-800 mb-3">Nova categoria</h3>
        <div className="flex gap-2 items-start">
          <div className="flex-1">
            <Input
              placeholder={placeholder}
              value={novoNome}
              onChange={(e) => {
                setNovoNome(e.target.value);
                setErroForm("");
              }}
              error={erroForm}
              maxLength={60}
            />
          </div>
          <Button type="submit" loading={criando}>
            <Plus className="w-4 h-4" /> Adicionar
          </Button>
        </div>
      </form>

      <div className="surface-card overflow-hidden">
        {carregando && (
          <div className="flex items-center gap-2 text-sm text-neutral-500 py-12 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
          </div>
        )}

        {!carregando && erroLista && (
          <p className="p-5 text-sm text-priority-urgente">{erroLista}</p>
        )}

        {!carregando && !erroLista && itens.length === 0 && (
          <p className="p-8 text-sm text-neutral-400 text-center">Nenhuma categoria cadastrada.</p>
        )}

        {!carregando && !erroLista && itens.length > 0 && (
          <ul className="divide-y divide-neutral-100">
            {itens.map((item) => {
              const editando = editandoId === item.id;
              return (
                <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    {editando ? (
                      <Input
                        value={nomeEdicao}
                        onChange={(e) => setNomeEdicao(e.target.value)}
                        maxLength={60}
                        autoFocus
                      />
                    ) : (
                      <>
                        <p className={`text-sm font-medium ${item.ativo ? "text-neutral-800" : "text-neutral-400"}`}>
                          {item.nome}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {item.emUso > 0 ? `${item.emUso} ${rotuloUso}` : "Sem uso"}
                        </p>
                      </>
                    )}
                  </div>

                  {!editando && (
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                        item.ativo ? "bg-primary-50 text-primary-700" : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {item.ativo ? "Ativa" : "Desativada"}
                    </span>
                  )}

                  <div className="flex items-center gap-1 shrink-0">
                    {editando ? (
                      <>
                        <button
                          onClick={() => salvarEdicao(item)}
                          disabled={salvandoId === item.id}
                          title="Salvar"
                          className="p-1.5 rounded-md text-primary-600 hover:bg-primary-50"
                        >
                          {salvandoId === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditandoId(null)}
                          title="Cancelar"
                          className="p-1.5 rounded-md text-neutral-400 hover:bg-neutral-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditandoId(item.id);
                            setNomeEdicao(item.nome);
                          }}
                          title="Renomear"
                          className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmacao({ tipo: item.ativo ? "desativar" : "ativar", item })}
                          title={item.ativo ? "Desativar" : "Ativar"}
                          className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmacao({ tipo: "excluir", item })}
                          disabled={item.emUso > 0}
                          title={item.emUso > 0 ? "Em uso — desative em vez de excluir" : "Excluir"}
                          className="p-1.5 rounded-md text-neutral-300 hover:text-priority-urgente hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-neutral-300 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        aberto={Boolean(confirmacao)}
        titulo={textosConfirmacao?.titulo}
        mensagem={textosConfirmacao?.mensagem}
        confirmarLabel={textosConfirmacao?.label}
        perigo={textosConfirmacao?.perigo}
        carregando={processando}
        onConfirmar={executarConfirmacao}
        onCancelar={() => setConfirmacao(null)}
      />
    </div>
  );
}
