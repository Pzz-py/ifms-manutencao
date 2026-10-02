import { useCallback, useEffect, useState } from "react";
import notificacaoService from "../services/notificacao.service";

const INTERVALO_ATUALIZACAO_MS = 30000;

export function useNotificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [carregando, setCarregando] = useState(false);

  const buscarContagem = useCallback(async () => {
    try {
      const total = await notificacaoService.contarNaoLidas();
      setNaoLidas(total);
    } catch {
      // Falha silenciosa: a contagem é um "nice to have", não deve
      // gerar um alerta de erro para o usuário a cada 30s.
    }
  }, []);

  const buscarLista = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await notificacaoService.listar();
      setNotificacoes(dados);
    } catch {
      // idem
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    buscarContagem();
    const intervalo = setInterval(buscarContagem, INTERVALO_ATUALIZACAO_MS);
    return () => clearInterval(intervalo);
  }, [buscarContagem]);

  async function marcarComoLida(id) {
    setNotificacoes((atual) =>
      atual.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
    setNaoLidas((atual) => Math.max(atual - 1, 0));
    try {
      await notificacaoService.marcarComoLida(id);
    } catch {
      buscarLista();
      buscarContagem();
    }
  }

  async function marcarTodasComoLidas() {
    setNotificacoes((atual) => atual.map((n) => ({ ...n, lida: true })));
    setNaoLidas(0);
    try {
      await notificacaoService.marcarTodasComoLidas();
    } catch {
      buscarLista();
      buscarContagem();
    }
  }

  return {
    notificacoes,
    naoLidas,
    carregando,
    buscarLista,
    marcarComoLida,
    marcarTodasComoLidas,
  };
}
