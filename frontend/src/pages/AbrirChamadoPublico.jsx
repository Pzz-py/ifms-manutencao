import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Wrench,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
  ChevronDown,
} from "lucide-react";
import Textarea from "../components/Textarea";
import Select from "../components/Select";
import Input from "../components/Input";
import Button from "../components/Button";
import ImageDropzone from "../components/ImageDropzone";
import localService from "../services/local.service";
import { useLocais } from "../hooks/useLocais";
import chamadoService from "../services/chamado.service";
import { useCategoriasChamado } from "../hooks/useCategoriasChamado";
import { getErrorMessage } from "../utils/getErrorMessage";

/**
 * Fluxo de abertura de chamado SEM LOGIN (Prioridade 1 do escopo):
 * a pessoa escaneia o QR Code fixado no ambiente, cai direto aqui com o
 * local já identificado pela URL (?local=CODIGO) e só precisa informar
 * categoria + descrição (+ foto opcional). Título e prioridade são
 * definidos automaticamente/depois — a pessoa que abre o chamado nunca
 * escolhe a prioridade, isso é papel da administração.
 *
 * Esta página fica FORA do <ProtectedRoute> de propósito (ver
 * routes/AppRoutes.jsx) — é o único ponto do sistema pensado para
 * funcionar sem autenticação.
 */
export default function AbrirChamadoPublico() {
  const [searchParams] = useSearchParams();
  const codigoLocal = searchParams.get("local");

  const [local, setLocal] = useState(null);
  const [carregandoLocal, setCarregandoLocal] = useState(Boolean(codigoLocal));
  const [erroLocal, setErroLocal] = useState("");

  // Quando a pessoa acessa /chamado direto (sem escanear um QR Code),
  // ela escolhe o ambiente numa lista — continua sem precisar de login.
  const { locais } = useLocais();
  const { ativas: categoriasAtivas } = useCategoriasChamado();
  const [localSelecionadoId, setLocalSelecionadoId] = useState("");

  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagem, setImagem] = useState(null);
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [mostrarContato, setMostrarContato] = useState(false);

  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [chamadoCriado, setChamadoCriado] = useState(null);

  useEffect(() => {
    // Sem código na URL, a pessoa escolhe o local na lista (ver abaixo).
    if (!codigoLocal) {
      setCarregandoLocal(false);
      return;
    }

    localService
      .buscarPorCodigo(codigoLocal)
      .then(setLocal)
      .catch((err) =>
        setErroLocal(getErrorMessage(err, "Local não encontrado. Verifique o QR Code utilizado."))
      )
      .finally(() => setCarregandoLocal(false));
  }, [codigoLocal]);

  function validar() {
    const novosErros = {};
    if (!descricao.trim()) novosErros.descricao = "Descreva o problema encontrado.";
    if (!categoria) novosErros.categoria = "Selecione uma categoria.";
    if (!codigoLocal && !localSelecionadoId) novosErros.local = "Selecione o local do problema.";
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErroGeral("");
    if (!validar()) return;

    setEnviando(true);
    try {
      const codigo =
        codigoLocal || locais.find((l) => l.id === localSelecionadoId)?.codigo;

      const chamado = await chamadoService.criarPublico({
        descricao,
        categoria,
        localCodigo: codigo,
        nome,
        contato,
        imagem,
      });
      setChamadoCriado(chamado);
    } catch (err) {
      setErroGeral(getErrorMessage(err, "Não foi possível abrir o chamado. Tente novamente."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Marca */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <div className="text-center leading-tight">
            <p className="font-display font-bold text-neutral-900">Manutenção IFMS</p>
            <p className="text-xs text-neutral-500">Campus Jardim</p>
          </div>
        </div>

        {carregandoLocal && (
          <div className="surface-card p-8 flex items-center justify-center gap-2 text-sm text-neutral-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Identificando o local...
          </div>
        )}

        {!carregandoLocal && erroLocal && (
          <div className="surface-card p-6 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-priority-urgente/10 text-priority-urgente flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-display font-semibold text-neutral-900 mb-1">
                Não foi possível identificar o local
              </p>
              <p className="text-sm text-neutral-500">{erroLocal}</p>
            </div>
          </div>
        )}

        {!carregandoLocal && !erroLocal && chamadoCriado && (
          <div className="surface-card p-8 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="font-display font-bold text-lg text-neutral-900 mb-1">
              Chamado registrado!
            </p>
            <p className="text-sm text-neutral-500 mb-4">
              Sua solicitação foi enviada para a equipe de manutenção.
            </p>
            <div className="inline-block font-mono text-sm bg-neutral-100 text-neutral-700 rounded-lg px-4 py-2">
              #{String(chamadoCriado.numero).padStart(4, "0")}
            </div>
            <p className="text-xs text-neutral-400 mt-4">
              Guarde esse número caso precise consultar o andamento com a administração.
            </p>
          </div>
        )}

        {!carregandoLocal && !erroLocal && !chamadoCriado && (
          <form onSubmit={handleSubmit} className="surface-card p-6 space-y-4">
            {local ? (
              <div className="flex items-center gap-2.5 bg-primary-50 rounded-lg px-4 py-3">
                <MapPin className="w-4 h-4 text-primary-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-primary-700">{local.nome}</p>
                  {local.bloco && <p className="text-xs text-primary-600/80">{local.bloco}</p>}
                </div>
              </div>
            ) : (
              <Select
                id="local"
                label="Onde está o problema?"
                value={localSelecionadoId}
                onChange={(e) => setLocalSelecionadoId(e.target.value)}
                error={erros.local}
              >
                <option value="">Selecione o local...</option>
                {locais.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome}
                    {l.bloco ? ` — ${l.bloco}` : ""}
                  </option>
                ))}
              </Select>
            )}

            {erroGeral && (
              <div className="flex items-start gap-2 bg-priority-urgente/10 text-priority-urgente text-sm rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{erroGeral}</span>
              </div>
            )}

            <Select
              id="categoria"
              label="Categoria do problema"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              error={erros.categoria}
            >
              <option value="">Selecione...</option>
              {categoriasAtivas.map((c) => (
                <option key={c.id} value={c.codigo}>
                  {c.nome}
                </option>
              ))}
            </Select>

            <Textarea
              id="descricao"
              label="Descreva o problema"
              rows={4}
              placeholder="O que está acontecendo? Desde quando?"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              error={erros.descricao}
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Foto <span className="text-neutral-400 font-normal">(opcional)</span>
              </label>
              <ImageDropzone value={imagem} onChange={setImagem} />
            </div>

            {/* Nome/contato são opcionais — a pessoa não precisa de conta para abrir o chamado. */}
            <div>
              <button
                type="button"
                onClick={() => setMostrarContato((atual) => !atual)}
                className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${mostrarContato ? "rotate-180" : ""}`} />
                Quer receber um retorno? (opcional)
              </button>

              {mostrarContato && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <Input
                    id="nome"
                    label="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                  <Input
                    id="contato"
                    label="E-mail ou telefone"
                    value={contato}
                    onChange={(e) => setContato(e.target.value)}
                  />
                </div>
              )}
            </div>

            <Button type="submit" loading={enviando} className="w-full">
              <Send className="w-4 h-4" /> Enviar chamado
            </Button>
          </form>
        )}
        {/* Acesso da administração — discreto, fora do caminho do usuário comum. */}
        <p className="text-center text-xs text-neutral-400 mt-6">
          É da equipe de manutenção?{" "}
          <Link to="/login" className="text-primary-600 hover:underline font-medium">
            Entrar no sistema
          </Link>
        </p>
      </div>
    </div>
  );
}
