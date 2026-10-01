import { useCallback, useEffect, useState } from "react";
import chamadoService from "../services/chamado.service";
import { getErrorMessage } from "../utils/getErrorMessage";
import { STATUS_CHAMADO_PADRAO_LISTA } from "../utils/statusConfig";

// Ao abrir a tela de chamados pela primeira vez, o filtro de status já
// nasce em "Novos" (pedido explícito do escopo, item 13) — a pessoa
// sempre pode trocar para "Todos os status" com um clique.
const FILTROS_INICIAIS = {
  status: STATUS_CHAMADO_PADRAO_LISTA,
  categoria: "",
  prioridade: "",
  localId: "",
  responsavelId: "",
  page: 1,
  pageSize: 10,
  ordenarPor: "createdAt",
  ordem: "desc",
};

// "Limpar filtros" reseta tudo de verdade, inclusive o status — é
// diferente do estado inicial, que só pré-seleciona "Novos".
const FILTROS_VAZIOS = { ...FILTROS_INICIAIS, status: "" };

export function useChamados() {
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS);
  const [buscaInput, setBuscaInput] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");

  const [itens, setItens] = useState([]);
  const [paginacao, setPaginacao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Debounce da busca em texto livre: evita disparar uma requisição
  // a cada tecla digitada.
  useEffect(() => {
    const timer = setTimeout(() => setBuscaDebounced(buscaInput), 400);
    return () => clearTimeout(timer);
  }, [buscaInput]);

  // Qualquer mudança de busca volta para a página 1.
  useEffect(() => {
    setFiltros((atual) => ({ ...atual, page: 1 }));
  }, [buscaDebounced]);

  const buscar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const resultado = await chamadoService.listar({ ...filtros, busca: buscaDebounced });
      setItens(resultado.itens);
      setPaginacao(resultado.paginacao);
    } catch (err) {
      setErro(getErrorMessage(err, "Não foi possível carregar os chamados."));
    } finally {
      setCarregando(false);
    }
  }, [filtros, buscaDebounced]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  /** Atualiza um filtro e volta para a página 1 (exceto quando o próprio filtro é a página). */
  function atualizarFiltro(campo, valor) {
    setFiltros((atual) => ({
      ...atual,
      [campo]: valor,
      page: campo === "page" ? valor : 1,
    }));
  }

  function limparFiltros() {
    setFiltros(FILTROS_VAZIOS);
    setBuscaInput("");
  }

  return {
    itens,
    paginacao,
    carregando,
    erro,
    filtros,
    buscaInput,
    setBuscaInput,
    atualizarFiltro,
    limparFiltros,
    recarregar: buscar,
  };
}
