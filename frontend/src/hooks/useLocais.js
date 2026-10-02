import { useEffect, useState } from "react";
import localService from "../services/local.service";

export function useLocais() {
  const [locais, setLocais] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    localService
      .listar()
      .then(setLocais)
      .catch(() => setLocais([]))
      .finally(() => setCarregando(false));
  }, []);

  return { locais, carregando };
}
