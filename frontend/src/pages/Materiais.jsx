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
  Package,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/Input";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";
import materialCatalogoService from "../services/materialCatalogo.service";
import { getErrorMessage } from "../utils/getErrorMessage";

const FORM_VAZIO = { nome: "", unidade: "" };

/**
 * Catálogo de materiais (administração): adicionar, editar e remover.
 * Os materiais cadastrados aqui são os que o administrador escolhe, em
 * cada chamado, para registrar o que foi gasto na resolução do problema.
 */
export default function Materiais() {
  const { usuario } = useAuth();
  const ehAdministrador = usuario?.role === "ADMINISTRADOR";

  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState("");

  const [novo, setNovo] = useState(FORM_VAZIO);
  const [criando, setCriando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [edicao, setEdicao] = useState(FORM_VAZIO);
  const [salvandoId, setSalvandoId] = useState(null);

  const [paraRemover, setParaRemover] = useState(null);
  const [removendo, setRemovendo] = useState(false);

  const [mensagem, setMensagem] = useState(null);
  const avisar = (tipo, texto) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem(null), 5000);
  };

  const carregar = useCallback(async () => {
    setErroLista("");
    try {
      setItens(await materialCatalogoService.listar());
    } catch (err) {
      setErroLista(getErrorMessage(err, "Não foi possível carregar os materiais."));
    } finally {
      setCarregando(false);
    }
  }, []);

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
          <p className="text-sm text-neutral-500">Somente administradores podem gerir os materiais.</p>
        </div>
      </div>
    );
  }

  async function handleCriar(e) {
    e.preventDefault();
    setErroForm("");
    if (novo.nome.trim().length < 2) {
      setErroForm("Informe o nome do material (mínimo 2 caracteres).");
      return;
    }
    setCriando(true);
    try {
      await materialCatalogoService.criar(novo);
      setNovo(FORM_VAZIO);
      await carregar();
      avisar("sucesso", "Material adicionado.");
    } catch (err) {
      setErroForm(getErrorMessage(err, "Não foi possível adicionar o material."));
    } finally {
      setCriando(false);
    }
  }

  async function salvarEdicao(item) {
    if (edicao.nome.trim().length < 2) {
      avisar("erro", "Informe o nome do material (mínimo 2 caracteres).");
      return;
    }
    setSalvandoId(item.id);
    try {
      await materialCatalogoService.atualizar(item.id, edicao);
      setEditandoId(null);
      await carregar();
      avisar("sucesso", "Material atualizado.");
    } catch (err) {
      avisar("erro", getErrorMessage(err, "Não foi possível salvar."));
    } finally {
      setSalvandoId(null);
    }
  }

  async function confirmarRemocao() {
    setRemovendo(true);
    try {
      await materialCatalogoService.remover(paraRemover.id);
      setParaRemover(null);
      await carregar();
      avisar("sucesso", "Material removido.");
    } catch (err) {
      setParaRemover(null);
      avisar("erro", getErrorMessage(err, "Não foi possível remover."));
    } finally {
      setRemovendo(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h2 className="font-display text-lg font-bold text-neutral-900">Materiais</h2>
        <p className="text-sm text-neutral-500 mt-0.5">
          Cadastre os materiais usados na manutenção. Em cada chamado você escolhe, entre eles, o que foi
          gasto na resolução do problema.
        </p>
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
        <h3 className="font-display font-semibold text-sm text-neutral-800 mb-3">Novo material</h3>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-start">
          <div className="flex-1">
            <Input
              placeholder="Ex: Lâmpada LED 9W"
              value={novo.nome}
              onChange={(e) => {
                setNovo((v) => ({ ...v, nome: e.target.value }));
                setErroForm("");
              }}
              error={erroForm}
              maxLength={80}
            />
          </div>
          <div className="sm:w-32">
            <Input
              placeholder="Unidade (un, m…)"
              value={novo.unidade}
              onChange={(e) => setNovo((v) => ({ ...v, unidade: e.target.value }))}
              maxLength={10}
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

        {!carregando && erroLista && <p className="p-5 text-sm text-priority-urgente">{erroLista}</p>}

        {!carregando && !erroLista && itens.length === 0 && (
          <div className="p-10 flex flex-col items-center text-center">
            <Package className="w-7 h-7 text-neutral-300 mb-2" />
            <p className="text-sm text-neutral-500">Nenhum material cadastrado ainda.</p>
            <p className="text-xs text-neutral-400 mt-1">Adicione o primeiro no campo acima.</p>
          </div>
        )}

        {!carregando && !erroLista && itens.length > 0 && (
          <ul className="divide-y divide-neutral-100">
            {itens.map((item) => {
              const editando = editandoId === item.id;
              return (
                <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    {editando ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1">
                          <Input
                            value={edicao.nome}
                            onChange={(e) => setEdicao((v) => ({ ...v, nome: e.target.value }))}
                            maxLength={80}
                            autoFocus
                          />
                        </div>
                        <div className="sm:w-28">
                          <Input
                            placeholder="Unidade"
                            value={edicao.unidade}
                            onChange={(e) => setEdicao((v) => ({ ...v, unidade: e.target.value }))}
                            maxLength={10}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-neutral-800">
                          {item.nome}
                          {item.unidade && (
                            <span className="ml-2 text-xs font-normal text-neutral-400">({item.unidade})</span>
                          )}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {item.emUso > 0 ? `Usado em ${item.emUso} registro(s) de chamado` : "Ainda não usado em chamados"}
                        </p>
                      </>
                    )}
                  </div>

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
                            setEdicao({ nome: item.nome, unidade: item.unidade || "" });
                          }}
                          title="Editar"
                          className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setParaRemover(item)}
                          title="Remover"
                          className="p-1.5 rounded-md text-neutral-300 hover:text-priority-urgente hover:bg-neutral-100"
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
        aberto={Boolean(paraRemover)}
        titulo="Remover material?"
        mensagem={
          paraRemover?.emUso > 0
            ? `"${paraRemover.nome}" sai do catálogo. Os ${paraRemover.emUso} registro(s) de chamados que já o usaram são mantidos, com o mesmo nome.`
            : `"${paraRemover?.nome}" será removido do catálogo.`
        }
        confirmarLabel="Remover"
        perigo
        carregando={removendo}
        onConfirmar={confirmarRemocao}
        onCancelar={() => setParaRemover(null)}
      />
    </div>
  );
}
