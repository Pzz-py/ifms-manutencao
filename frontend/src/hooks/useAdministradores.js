import { useEffect, useState } from "react";
import usuarioService from "../services/usuario.service";

export function useAdministradores(habilitado) {
  const [administradores, setAdministradores] = useState([]);
  const [carregando, setCarregando] = useState(Boolean(habilitado));

  useEffect(() => {
    if (!habilitado) return;
    usuarioService
      .listarAdministradores()
      .then(setAdministradores)
      .catch(() => setAdministradores([]))
      .finally(() => setCarregando(false));
  }, [habilitado]);

  return { administradores, carregando };
}
