import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, Send, Loader2, MapPin } from "lucide-react";
import Input from "../components/Input";
import Textarea from "../components/Textarea";
import Select from "../components/Select";
import Button from "../components/Button";
import ImageDropzone from "../components/ImageDropzone";
import { useLocais } from "../hooks/useLocais";
import { useCategoriasChamado } from "../hooks/useCategoriasChamado";
import { PRIORIDADE_CONFIG, ORDEM_PRIORIDADE } from "../utils/prioridadeConfig";
import chamadoService from "../services/chamado.service";
import localService from "../services/local.service";
import { getErrorMessage } from "../utils/getErrorMessage";

const VALORES_INICIAIS = {
  titulo: "",
  descricao: "",
  categoria: "",
  prioridade: "MEDIA",
  localId: "",
};

export default function NovoChamado() {
  const navigate = useNavigate();
  const { codigo } = useParams();
  const modoQR = Boolean(codigo);

  const { locais, carregando: carregandoLocais } = useLocais();
  const { ativas: categoriasAtivas, info: infoCategoria } = useCategoriasChamado();

  const [valores, setValores] = useState(VALORES_INICIAIS);
  const [imagem, setImagem] = useState(null);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Modo QR Code: o local vem fixo da URL (ver rota /chamados/novo/:codigo
  // em routes/AppRoutes.jsx). O usuário só precisa informar categoria,
  // descrição e a foto — título, prioridade e local ficam automáticos.
  const [localQR, setLocalQR] = useState(null);
  const [carregandoLocalQR, setCarregandoLocalQR] = useState(modoQR);
  const [erroLocalQR, setErroLocalQR] = useState("");

  useEffect(() => {
    if (!modoQR) return;

    setCarregandoLocalQR(true);
    localService
      .buscarPorCodigo(codigo)
      .then((local) => {
        setLocalQR(local);
        setValores((atual) => ({ ...atual, localId: local.id }));
      })
      .catch((err) => {
        setErroLocalQR(getErrorMessage(err, "QR Code inválido ou local não encontrado."));
      })
      .finally(() => setCarregandoLocalQR(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo]);

  function atualizarCampo(campo, valor) {
    setValores((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  }

  function validar() {
    const novosErros = {};
    if (!modoQR && !valores.titulo.trim()) novosErros.titulo = "Informe um título para o chamado.";
    if (!valores.descricao.trim()) novosErros.descricao = "Descreva o problema encontrado.";
    if (!valores.categoria) novosErros.categoria = "Selecione uma categoria.";
    if (!modoQR && !valores.localId) novosErros.localId = "Selecione o local.";
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErroGeral("");

    if (!validar()) return;

    const titulo = modoQR
      ? `${valores.categoria ? infoCategoria(valores.categoria).label : "Chamado"} — ${localQR?.nome || ""}`
      : valores.titulo;

    setEnviando(true);
    try {
      const chamadoCriado = await chamadoService.criar({ ...valores, titulo, imagem });
      navigate("/chamados", { state: { chamadoAbertoNumero: chamadoCriado.numero } });
    } catch (err) {
      setErroGeral(getErrorMessage(err, "Não foi possível abrir o chamado. Tente novamente."));
    } finally {
      setEnviando(false);
    }
  }

  if (modoQR && carregandoLocalQR) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-500 py-16 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> Identificando o local pelo QR Code...
      </div>
    );
  }

  if (modoQR && erroLocalQR) {
    return (
      <div className="surface-card p-8 max-w-lg flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-priority-urgente/10 text-priority-urgente flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-neutral-900 mb-1">
            Não foi possível abrir o chamado
          </h2>
          <p className="text-sm text-neutral-500">{erroLocalQR}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="font-display text-lg font-bold text-neutral-900">
          {modoQR ? `Abrir chamado — ${localQR.nome}` : "Abrir novo chamado"}
        </h2>
        <p className="text-sm text-neutral-500 mt-0.5">
          {modoQR
            ? "Local identificado automaticamente pelo QR Code. Complete as informações abaixo."
            : "Descreva o problema com o máximo de detalhes para agilizar o atendimento."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="surface-card p-6 space-y-5">
        {erroGeral && (
          <div className="flex items-start gap-2 bg-priority-urgente/10 text-priority-urgente text-sm rounded-lg px-3 py-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{erroGeral}</span>
          </div>
        )}

        {modoQR && (
          <div className="flex items-center gap-3 bg-primary-50 rounded-lg px-4 py-3">
            <MapPin className="w-4 h-4 text-primary-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary-700">{localQR.nome}</p>
              {localQR.bloco && <p className="text-xs text-primary-600/80">{localQR.bloco}</p>}
            </div>
          </div>
        )}

        {!modoQR && (
          <Input
            id="titulo"
            label="Título"
            placeholder="Ex: Lâmpada queimada no Laboratório 01"
            value={valores.titulo}
            onChange={(e) => atualizarCampo("titulo", e.target.value)}
            error={erros.titulo}
          />
        )}

        <Textarea
          id="descricao"
          label="Descrição"
          rows={4}
          placeholder="Descreva o problema: onde, desde quando, e qualquer detalhe relevante."
          value={valores.descricao}
          onChange={(e) => atualizarCampo("descricao", e.target.value)}
          error={erros.descricao}
        />

        <div className={modoQR ? "" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
          <Select
            id="categoria"
            label="Categoria"
            value={valores.categoria}
            onChange={(e) => atualizarCampo("categoria", e.target.value)}
            error={erros.categoria}
          >
            <option value="">Selecione...</option>
            {categoriasAtivas.map((c) => (
              <option key={c.id} value={c.codigo}>
                {c.nome}
              </option>
            ))}
          </Select>

          {!modoQR && (
            <Select
              id="localId"
              label="Local"
              value={valores.localId}
              onChange={(e) => atualizarCampo("localId", e.target.value)}
              error={erros.localId}
              disabled={carregandoLocais}
            >
              <option value="">{carregandoLocais ? "Carregando..." : "Selecione..."}</option>
              {locais.map((local) => (
                <option key={local.id} value={local.id}>
                  {local.nome}
                </option>
              ))}
            </Select>
          )}
        </div>

        {!modoQR && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Prioridade</label>
          <div className="flex flex-wrap gap-2">
            {ORDEM_PRIORIDADE.map((chave) => {
              const ativa = valores.prioridade === chave;
              return (
                <button
                  key={chave}
                  type="button"
                  onClick={() => atualizarCampo("prioridade", chave)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    ativa
                      ? `${PRIORIDADE_CONFIG[chave].badgeClass} border-transparent`
                      : "border-neutral-300 text-neutral-500 hover:bg-neutral-50"
                  }`}
                >
                  {PRIORIDADE_CONFIG[chave].label}
                </button>
              );
            })}
          </div>
        </div>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Foto do problema <span className="text-neutral-400 font-normal">(opcional)</span>
          </label>
          <ImageDropzone value={imagem} onChange={setImagem} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" loading={enviando}>
            <Send className="w-4 h-4" />
            Abrir chamado
          </Button>
        </div>
      </form>
    </div>
  );
}
