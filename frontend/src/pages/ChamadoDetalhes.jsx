import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  MapPin,
  User,
  Calendar,
  Paperclip,
  Send,
  Settings2,
  Printer,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useChamadoDetalhes } from "../hooks/useChamadoDetalhes";
import { useAdministradores } from "../hooks/useAdministradores";
import Badge from "../components/Badge";
import Select from "../components/Select";
import Textarea from "../components/Textarea";
import Button from "../components/Button";
import MateriaisChamado from "../components/MateriaisChamado";
import chamadoService from "../services/chamado.service";
import { getErrorMessage } from "../utils/getErrorMessage";
import { STATUS_CONFIG, ORDEM_STATUS } from "../utils/statusConfig";
import { PRIORIDADE_CONFIG, ORDEM_PRIORIDADE } from "../utils/prioridadeConfig";
import { useCategoriasChamado } from "../hooks/useCategoriasChamado";
import { EVENTO_CONFIG } from "../utils/eventoConfig";
import { formatarDataCompleta, formatarTempoRelativo } from "../utils/formatDate";

/** Monta uma descrição legível para eventos de mudança de status/prioridade/responsável. */
function descricaoEvento(evento) {
  if (evento.tipo === "MUDANCA_STATUS" && evento.valorAnterior && evento.valorNovo) {
    return `Status alterado de "${STATUS_CONFIG[evento.valorAnterior]?.label}" para "${STATUS_CONFIG[evento.valorNovo]?.label}".`;
  }
  if (evento.tipo === "MUDANCA_PRIORIDADE" && evento.valorAnterior && evento.valorNovo) {
    return `Prioridade alterada de "${PRIORIDADE_CONFIG[evento.valorAnterior]?.label}" para "${PRIORIDADE_CONFIG[evento.valorNovo]?.label}".`;
  }
  if (evento.tipo === "MUDANCA_RESPONSAVEL") {
    return `Responsável alterado de "${evento.valorAnterior}" para "${evento.valorNovo}".`;
  }
  return evento.descricao;
}

export default function ChamadoDetalhes() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const { chamado, setChamado, carregando, erro } = useChamadoDetalhes(id);

  const ehAdministrador = usuario?.role === "ADMINISTRADOR";
  const { info: infoCategoria } = useCategoriasChamado();
  const { administradores } = useAdministradores(ehAdministrador);

  const [campoSalvando, setCampoSalvando] = useState(null);
  const [erroAcao, setErroAcao] = useState("");

  const [textoObservacao, setTextoObservacao] = useState("");
  const [enviandoObservacao, setEnviandoObservacao] = useState(false);

  async function atualizarCampo(campo, valor) {
    setErroAcao("");
    setCampoSalvando(campo);
    try {
      const atualizado = await chamadoService.atualizar(chamado.id, { [campo]: valor });
      setChamado(atualizado);
    } catch (err) {
      setErroAcao(getErrorMessage(err, "Não foi possível salvar a alteração."));
    } finally {
      setCampoSalvando(null);
    }
  }

  async function handleEnviarObservacao(e) {
    e.preventDefault();
    if (!textoObservacao.trim()) return;

    setEnviandoObservacao(true);
    setErroAcao("");
    try {
      const atualizado = await chamadoService.adicionarObservacao(chamado.id, textoObservacao);
      setChamado(atualizado);
      setTextoObservacao("");
    } catch (err) {
      setErroAcao(getErrorMessage(err, "Não foi possível enviar a observação."));
    } finally {
      setEnviandoObservacao(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-500 py-16 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando chamado...
      </div>
    );
  }

  if (erro || !chamado) {
    return (
      <div className="surface-card p-8 max-w-lg flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-priority-urgente/10 text-priority-urgente flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-neutral-900 mb-1">
            Não foi possível abrir este chamado
          </h2>
          <p className="text-sm text-neutral-500">{erro}</p>
          <Link to="/chamados" className="inline-block mt-3 text-sm font-medium text-primary-600 hover:underline">
            Voltar para Chamados
          </Link>
        </div>
      </div>
    );
  }

  const CategoriaIcon = infoCategoria(chamado.categoria).icon;

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between gap-3 no-print">
        <Link
          to="/chamados"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700"
        >
          <ArrowLeft className="w-4 h-4" /> Chamados
        </Link>

        <Button variant="secondary" onClick={() => window.print()}>
          <Printer className="w-4 h-4" /> Exportar PDF
        </Button>
      </div>

      {/* Cabeçalho institucional — só aparece no papel/PDF. */}
      <div className="hidden print:block border-b border-neutral-300 pb-3 mb-2">
        <p className="font-display font-bold text-neutral-900">
          Relatório de Chamado de Manutenção
        </p>
        <p className="text-xs text-neutral-500">
          IFMS — Campus Jardim · Emitido em {formatarDataCompleta(new Date())}
        </p>
      </div>

      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-neutral-400 mb-1">
            #{String(chamado.numero).padStart(4, "0")}
          </p>
          <h1 className="font-display text-xl font-bold text-neutral-900">{chamado.titulo}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge tipo="prioridade" valor={chamado.prioridade} />
          <Badge tipo="status" valor={chamado.status} />
        </div>
      </div>

      {erroAcao && (
        <div className="flex items-start gap-2 bg-priority-urgente/10 text-priority-urgente text-sm rounded-lg px-3 py-2.5 no-print">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{erroAcao}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 print-single-column">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-5">
          {/* Descrição */}
          <div className="surface-card p-5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">
              {CategoriaIcon && <CategoriaIcon className="w-3.5 h-3.5" />}
              {infoCategoria(chamado.categoria).label}
            </div>
            <p className="text-sm text-neutral-700 whitespace-pre-line leading-relaxed">
              {chamado.descricao}
            </p>

            {chamado.anexos.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">
                  <Paperclip className="w-3.5 h-3.5" /> Anexo
                </p>
                <div className="flex flex-wrap gap-3">
                  {chamado.anexos.map((anexo) => (
                    <a key={anexo.id} href={anexo.url} target="_blank" rel="noreferrer">
                      <img
                        src={anexo.url}
                        alt={anexo.nomeArquivo}
                        className="w-32 h-32 object-cover rounded-lg border border-neutral-200 hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Materiais */}
          <MateriaisChamado
            chamadoId={chamado.id}
            materiais={chamado.materiais}
            ehAdministrador={ehAdministrador}
            onAtualizar={setChamado}
          />

          {/* Observações */}
          <div className="surface-card p-5">
            <h3 className="font-display font-semibold text-sm text-neutral-800 mb-4">
              Observações
            </h3>

            {chamado.observacoes.length === 0 ? (
              <p className="text-sm text-neutral-400">Nenhuma observação registrada ainda.</p>
            ) : (
              <ul className="space-y-4">
                {chamado.observacoes.map((obs) => (
                  <li key={obs.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-xs font-semibold shrink-0">
                      {obs.autor.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <p className="text-sm font-medium text-neutral-800">{obs.autor}</p>
                        <p className="text-xs text-neutral-400">
                          {formatarTempoRelativo(obs.createdAt)}
                        </p>
                      </div>
                      <p className="text-sm text-neutral-600 mt-0.5 whitespace-pre-line">
                        {obs.texto}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {ehAdministrador && (
              <form onSubmit={handleEnviarObservacao} className="mt-5 pt-4 border-t border-neutral-100 no-print">
                <Textarea
                  rows={2}
                  placeholder="Escreva uma observação para o solicitante..."
                  value={textoObservacao}
                  onChange={(e) => setTextoObservacao(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <Button type="submit" loading={enviandoObservacao} disabled={!textoObservacao.trim()}>
                    <Send className="w-4 h-4" /> Enviar
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Linha do tempo */}
          <div className="surface-card p-5">
            <h3 className="font-display font-semibold text-sm text-neutral-800 mb-4">
              Linha do tempo
            </h3>
            <ul className="space-y-4">
              {chamado.historico.map((evento) => {
                const config = EVENTO_CONFIG[evento.tipo] || EVENTO_CONFIG.OBSERVACAO;
                const Icon = config.icon;
                return (
                  <li key={evento.id} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-neutral-700 leading-snug">{descricaoEvento(evento)}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {evento.autor} · {formatarTempoRelativo(evento.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-5">
          {/* Detalhes */}
          <div className="surface-card p-5">
            <h3 className="font-display font-semibold text-sm text-neutral-800 mb-4">Detalhes</h3>
            <dl className="space-y-3.5 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-neutral-400 text-xs">Local</dt>
                  <dd className="text-neutral-700 font-medium">
                    {chamado.local.nome}
                    {chamado.local.bloco && (
                      <span className="text-neutral-400 font-normal"> · {chamado.local.bloco}</span>
                    )}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-neutral-400 text-xs">Solicitante</dt>
                  <dd className="text-neutral-700 font-medium">
                    {chamado.solicitanteNome}
                    {!chamado.solicitante && (
                      <span className="ml-1.5 text-xs font-normal text-neutral-400">(sem login)</span>
                    )}
                  </dd>
                  {chamado.solicitanteContato && (
                    <dd className="text-neutral-500 text-xs mt-0.5">{chamado.solicitanteContato}</dd>
                  )}
                  {chamado.solicitante?.email && (
                    <dd className="text-neutral-500 text-xs mt-0.5">{chamado.solicitante.email}</dd>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-neutral-400 text-xs">Aberto em</dt>
                  <dd className="text-neutral-700 font-medium">
                    {formatarDataCompleta(chamado.createdAt)}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          {/* Gerenciar (admin) */}
          {ehAdministrador && (
            <div className="surface-card p-5 no-print">
              <h3 className="flex items-center gap-1.5 font-display font-semibold text-sm text-neutral-800 mb-4">
                <Settings2 className="w-4 h-4" /> Gerenciar
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-neutral-700 mb-1.5">
                    Status
                    {campoSalvando === "status" && (
                      <Loader2 className="w-3.5 h-3.5 text-neutral-400 animate-spin" />
                    )}
                  </label>
                  <Select
                    value={chamado.status}
                    disabled={campoSalvando === "status"}
                    onChange={(e) => atualizarCampo("status", e.target.value)}
                  >
                    {ORDEM_STATUS.map((chave) => (
                      <option key={chave} value={chave}>
                        {STATUS_CONFIG[chave].label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-neutral-700 mb-1.5">
                    Prioridade
                    {campoSalvando === "prioridade" && (
                      <Loader2 className="w-3.5 h-3.5 text-neutral-400 animate-spin" />
                    )}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ORDEM_PRIORIDADE.map((chave) => {
                      const ativa = chamado.prioridade === chave;
                      return (
                        <button
                          key={chave}
                          type="button"
                          disabled={campoSalvando === "prioridade"}
                          onClick={() => atualizarCampo("prioridade", chave)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
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

                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-neutral-700 mb-1.5">
                    Responsável
                    {campoSalvando === "responsavelId" && (
                      <Loader2 className="w-3.5 h-3.5 text-neutral-400 animate-spin" />
                    )}
                  </label>
                  <Select
                    value={chamado.responsavel?.id || ""}
                    disabled={campoSalvando === "responsavelId"}
                    onChange={(e) => atualizarCampo("responsavelId", e.target.value || null)}
                  >
                    <option value="">Ninguém atribuído</option>
                    {administradores.map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.nome}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
