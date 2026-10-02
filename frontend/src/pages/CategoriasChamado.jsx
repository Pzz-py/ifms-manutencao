import GestaoCategorias from "../components/GestaoCategorias";
import { categoriaChamadoService } from "../services/categoria.service";

export default function CategoriasChamado() {
  return (
    <GestaoCategorias
      titulo="Categorias de chamados"
      descricao="Tipos de problema oferecidos no formulário de abertura (inclusive nos QR Codes). Categorias desativadas deixam de aparecer para novos chamados, mas o histórico é preservado."
      placeholder="Ex: Segurança, Jardinagem..."
      rotuloUso="chamado(s)"
      service={categoriaChamadoService}
    />
  );
}
