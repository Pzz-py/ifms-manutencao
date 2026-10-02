import { useEffect, useState } from "react";
import { categoriaChamadoService } from "../services/categoria.service";
import { infoCategoria } from "../utils/categoriaConfig";

/**
 * Categorias de chamado vindas do banco (rota pública, funciona sem login).
 * - `ativas`: para novos chamados.
 * - `todas`: inclui desativadas, para filtros/relatórios de chamados antigos.
 * - `info(codigo)`: rótulo/cor/ícone de qualquer categoria, mesmo desativada.
 */
export function useCategoriasChamado() {
  const [todas, setTodas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    categoriaChamadoService
      .listar()
      .then(setTodas)
      .catch(() => setTodas([]))
      .finally(() => setCarregando(false));
  }, []);

  const nomePorCodigo = Object.fromEntries(todas.map((c) => [c.codigo, c.nome]));

  return {
    todas,
    ativas: todas.filter((c) => c.ativo),
    carregando,
    info: (codigo) => infoCategoria(codigo, nomePorCodigo[codigo]),
  };
}
