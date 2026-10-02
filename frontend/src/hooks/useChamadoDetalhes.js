import { useCallback, useEffect, useState } from "react";
import chamadoService from "../services/chamado.service";
import { getErrorMessage } from "../utils/getErrorMessage";

export function useChamadoDetalhes(id) {
  const [chamado, setChamado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const buscar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const dados = await chamadoService.buscarPorId(id);
      setChamado(dados);
    } catch (err) {
      setErro(getErrorMessage(err, "Não foi possível carregar o chamado."));
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  return { chamado, setChamado, carregando, erro, recarregar: buscar };
}
