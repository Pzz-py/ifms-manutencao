import { useCallback, useEffect, useState } from "react";
import dashboardService from "../services/dashboard.service";
import { getErrorMessage } from "../utils/getErrorMessage";

export function useDashboard() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const buscar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const resumo = await dashboardService.obterResumo();
      setDados(resumo);
    } catch (err) {
      setErro(getErrorMessage(err, "Não foi possível carregar o dashboard."));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    buscar();
  }, [buscar]);

  return { dados, carregando, erro, recarregar: buscar };
}
