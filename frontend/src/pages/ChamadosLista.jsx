import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X, Loader2, AlertTriangle, PlusCircle, CheckCircle2 } from "lucide-react";
import { useChamados } from "../hooks/useChamados";
import { useLocais } from "../hooks/useLocais";
import { useAdministradores } from "../hooks/useAdministradores";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/Input";
import Select from "../components/Select";
import Badge from "../components/Badge";
import Pagination from "../components/Pagination";
import Button from "../components/Button";
import { STATUS_CONFIG, ORDEM_STATUS } from "../utils/statusConfig";
import { useCategoriasChamado } from "../hooks/useCategoriasChamado";
import { PRIORIDADE_CONFIG, ORDEM_PRIORIDADE } from "../utils/prioridadeConfig";
import { formatarDataCompleta } from "../utils/formatDate";

export default function ChamadosLista() {
  const location = useLocation();
  const { usuario } = useAuth();
  const ehAdministrador = usuario?.role === "ADMINISTRADOR";
  const { locais } = useLocais();
  const { todas: todasCategorias, info: infoCategoria } = useCategoriasChamado();
  const { administradores } = useAdministradores(ehAdministrador);
  const {
    itens,
    paginacao,
    carregando,
    erro,
    filtros,
    buscaInput,
    setBuscaInput,
    atualizarFiltro,
    limparFiltros,
  } = useChamados();

  const [avisoAbertura, setAvisoAbertura] = useState(location.state?.chamadoAbertoNumero);

  useEffect(() => {
    if (!avisoAbertura) return;
    const timer = setTimeout(() => setAvisoAbertura(null), 6000);
    return () => clearTimeout(timer);
  }, [avisoAbertura]);

  const filtrosAtivos =
    filtros.status ||
    filtros.categoria ||
    filtros.prioridade ||
    filtros.localId ||
    filtros.responsavelId ||
    buscaInput;

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-neutral-900">Chamados</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Acompanhe e filtre os chamados de manutenção.
          </p>
        </div>
        <Link to="/chamados/novo">
          <Button>
            <PlusCircle className="w-4 h-4" />
            Novo chamado
          </Button>
        </Link>
      </div>

      {avisoAbertura && (
        <div className="flex items-center gap-2.5 bg-primary-50 text-primary-700 text-sm rounded-lg px-4 py-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Chamado #{String(avisoAbertura).padStart(4, "0")} aberto com sucesso.
        </div>
      )}

      {/* Filtros */}
      <div className="surface-card p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar por título ou descrição..."
              icon={Search}
              value={buscaInput}
              onChange={(e) => setBuscaInput(e.target.value)}
            />
          </div>

          <div className="lg:w-44 shrink-0">
            <Select value={filtros.status} onChange={(e) => atualizarFiltro("status", e.target.value)}>
              <option value="">Todos os status</option>
              {ORDEM_STATUS.map((chave) => (
                <option key={chave} value={chave}>
                  {STATUS_CONFIG[chave].label}
                </option>
              ))}
            </Select>
          </div>

          <div className="lg:w-44 shrink-0">
            <Select value={filtros.categoria} onChange={(e) => atualizarFiltro("categoria", e.target.value)}>
              <option value="">Todas as categorias</option>
              {todasCategorias.map((c) => (
                <option key={c.id} value={c.codigo}>
                  {c.nome}
                  {c.ativo ? "" : " (desativada)"}
                </option>
              ))}
            </Select>
          </div>

          <div className="lg:w-40 shrink-0">
            <Select value={filtros.prioridade} onChange={(e) => atualizarFiltro("prioridade", e.target.value)}>
              <option value="">Toda prioridade</option>
              {ORDEM_PRIORIDADE.map((chave) => (
                <option key={chave} value={chave}>
                  {PRIORIDADE_CONFIG[chave].label}
                </option>
              ))}
            </Select>
          </div>

          <div className="lg:w-44 shrink-0">
            <Select value={filtros.localId} onChange={(e) => atualizarFiltro("localId", e.target.value)}>
              <option value="">Todos os locais</option>
              {locais.map((local) => (
                <option key={local.id} value={local.id}>
                  {local.nome}
                </option>
              ))}
            </Select>
          </div>

          {ehAdministrador && (
            <div className="lg:w-44 shrink-0">
              <Select
                value={filtros.responsavelId}
                onChange={(e) => atualizarFiltro("responsavelId", e.target.value)}
              >
                <option value="">Todo responsável</option>
                {administradores.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.nome}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {filtrosAtivos && (
            <button
              onClick={limparFiltros}
              className="flex items-center justify-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 px-3 shrink-0"
              title="Limpar filtros"
            >
              <X className="w-4 h-4" /> Limpar
            </button>
          )}
        </div>
      </div>

      {/* Resultado */}
      <div className="surface-card overflow-hidden">
        {carregando && (
          <div className="flex items-center gap-2 text-sm text-neutral-500 py-16 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando chamados...
          </div>
        )}

        {!carregando && erro && (
          <div className="flex items-start gap-3 p-6">
            <AlertTriangle className="w-5 h-5 text-priority-urgente shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-neutral-800">Não foi possível carregar</p>
              <p className="text-sm text-neutral-500 mt-0.5">{erro}</p>
            </div>
          </div>
        )}

        {!carregando && !erro && itens.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <SlidersHorizontal className="w-8 h-8 text-neutral-300 mb-3" />
            <p className="text-sm font-medium text-neutral-700">Nenhum chamado encontrado</p>
            <p className="text-sm text-neutral-400 mt-1 max-w-xs">
              {filtrosAtivos
                ? "Tente ajustar os filtros ou o termo de busca."
                : "Ainda não há chamados registrados."}
            </p>
          </div>
        )}

        {!carregando && !erro && itens.length > 0 && (
          <div className="p-4">
            {/* Cabeçalho (desktop) */}
            <div className="hidden md:flex items-center gap-4 px-2 pb-2 text-xs font-medium text-neutral-400 uppercase tracking-wide">
              <span className="w-14 shrink-0">Nº</span>
              <span className="flex-1">Chamado</span>
              <span className="w-32 shrink-0">Categoria</span>
              <span className="w-24 shrink-0">Prioridade</span>
              <span className="w-36 shrink-0">Status</span>
              <span className="w-20 shrink-0 text-right">Data</span>
            </div>

            <div className="divide-y divide-neutral-100">
              {itens.map((chamado) => {
                const CategoriaIcon = infoCategoria(chamado.categoria).icon;
                return (
                  <Link
                    key={chamado.id}
                    to={`/chamados/${chamado.id}`}
                    className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 py-3.5 px-2 hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    <span className="font-mono text-xs text-neutral-400 md:w-14 shrink-0">
                      #{String(chamado.numero).padStart(4, "0")}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-800 truncate">{chamado.titulo}</p>
                      <p className="text-xs text-neutral-400 truncate">
                        {chamado.local} · {chamado.solicitante}
                      </p>
                    </div>

                    <div className="hidden md:flex items-center gap-1.5 w-32 shrink-0 text-sm text-neutral-500">
                      {CategoriaIcon && <CategoriaIcon className="w-3.5 h-3.5 text-neutral-400" />}
                      <span className="truncate">{infoCategoria(chamado.categoria).label}</span>
                    </div>

                    <div className="w-24 shrink-0">
                      <Badge tipo="prioridade" valor={chamado.prioridade} />
                    </div>

                    <div className="w-36 shrink-0">
                      <Badge tipo="status" valor={chamado.status} />
                    </div>

                    <span className="hidden md:block w-20 shrink-0 text-xs text-neutral-400 text-right">
                      {formatarDataCompleta(chamado.createdAt)}
                    </span>
                  </Link>
                );
              })}
            </div>

            <Pagination
              paginacao={paginacao}
              onMudarPagina={(pagina) => atualizarFiltro("page", pagina)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
