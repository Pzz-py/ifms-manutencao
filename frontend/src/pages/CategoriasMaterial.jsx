import GestaoCategorias from "../components/GestaoCategorias";
import { categoriaMaterialService } from "../services/categoria.service";

export default function CategoriasMaterial() {
  return (
    <GestaoCategorias
      titulo="Categorias de materiais"
      descricao="Agrupam os materiais registrados nos chamados (ex: lâmpadas, fios e cabos). Apenas cadastro — não é controle de estoque."
      placeholder="Ex: Fechaduras e dobradiças..."
      rotuloUso="material(is)"
      service={categoriaMaterialService}
    />
  );
}
