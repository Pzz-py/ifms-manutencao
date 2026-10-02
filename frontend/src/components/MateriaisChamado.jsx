import { useEffect, useState } from "react";
import { Package, Plus, Check, Trash2, Loader2 } from "lucide-react";
import Input from "./Input";
import Button from "./Button";
import Select from "./Select";
import materialCatalogoService from "../services/materialCatalogo.service";
import chamadoService from "../services/chamado.service";
import { getErrorMessage } from "../utils/getErrorMessage";

const OUTRO = "__outro__";
// Por padrão o material entra como "gasto" (já utilizado na resolução);
// desmarque para registrar apenas como necessário/a ser usado.
const VALORES_INICIAIS = { catalogoId: "", nome: "", quantidade: 1, observacao: "", utilizado: true };

/**
 * Materiais necessários/utilizados na manutenção (item 10 do escopo).
 * Não é um controle de estoque — só um registro simples associado ao
 * chamado, pensado para aparecer no relatório final.
 */
export default function MateriaisChamado({ chamadoId, materiais, ehAdministrador, onAtualizar }) {
  const [valores, setValores] = useState(VALORES_INICIAIS);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [atualizandoId, setAtualizandoId] = useState(null);
  const [catalogo, setCatalogo] = useState([]);

  // Catálogo de materiais (gerido em Administração > Materiais). Só o
  // administrador vê o formulário, e a rota da API é restrita a ele.
  useEffect(() => {
    if (!ehAdministrador) return;
    materialCatalogoService
      .listar()
      .then(setCatalogo)
      .catch(() => setCatalogo([]));
  }, [ehAdministrador]);

  async function handleAdicionar(e) {
    e.preventDefault();
    const doCatalogo = valores.catalogoId && valores.catalogoId !== OUTRO;
    if (!valores.catalogoId) {
      setErro("Escolha o material usado.");
      return;
    }
    if (!doCatalogo && !valores.nome.trim()) {
      setErro("Informe o nome do material.");
      return;
    }
    if (!(Number(valores.quantidade) >= 1)) {
      setErro("A quantidade deve ser pelo menos 1.");
      return;
    }

    setErro("");
    setEnviando(true);
    try {
      const chamado = await chamadoService.adicionarMaterial(chamadoId, {
        catalogoId: doCatalogo ? valores.catalogoId : undefined,
        nome: doCatalogo ? undefined : valores.nome,
        quantidade: valores.quantidade,
        observacao: valores.observacao,
        utilizado: valores.utilizado,
      });
      onAtualizar(chamado);
      setValores(VALORES_INICIAIS);
    } catch (err) {
      setErro(getErrorMessage(err, "Não foi possível registrar o material."));
    } finally {
      setEnviando(false);
    }
  }

  async function alternarUtilizado(material) {
    setAtualizandoId(material.id);
    try {
      const chamado = await chamadoService.atualizarMaterial(chamadoId, material.id, {
        utilizado: !material.utilizado,
      });
      onAtualizar(chamado);
    } catch {
      // Falha silenciosa é aceitável aqui: o estado visual simplesmente não muda,
      // e a pessoa pode tentar de novo — não é uma ação destrutiva.
    } finally {
      setAtualizandoId(null);
    }
  }

  async function remover(material) {
    setAtualizandoId(material.id);
    try {
      const chamado = await chamadoService.removerMaterial(chamadoId, material.id);
      onAtualizar(chamado);
    } catch {
      // idem
    } finally {
      setAtualizandoId(null);
    }
  }

  return (
    <div className="surface-card p-5">
      <h3 className="flex items-center gap-1.5 font-display font-semibold text-sm text-neutral-800 mb-4">
        <Package className="w-4 h-4" /> Materiais
      </h3>

      {materiais.length === 0 ? (
        <p className="text-sm text-neutral-400">Nenhum material registrado ainda.</p>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {materiais.map((material) => (
            <li key={material.id} className="flex items-center gap-3 py-2.5">
              {ehAdministrador ? (
                <button
                  onClick={() => alternarUtilizado(material)}
                  disabled={atualizandoId === material.id}
                  title={material.utilizado ? "Desmarcar como gasto" : "Marcar como gasto"}
                  className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    material.utilizado
                      ? "bg-primary-500 border-primary-500 text-white"
                      : "border-neutral-300 hover:border-primary-400"
                  }`}
                >
                  {atualizandoId === material.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    material.utilizado && <Check className="w-3 h-3" />
                  )}
                </button>
              ) : (
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${material.utilizado ? "bg-primary-500" : "bg-neutral-300"}`}
                />
              )}

              <div className="min-w-0 flex-1">
                <p className="text-sm text-neutral-700">
                  {material.nome} <span className="text-neutral-400">× {material.quantidade}</span>
                </p>
                {material.observacao && (
                  <p className="text-xs text-neutral-400 mt-0.5">{material.observacao}</p>
                )}
              </div>

              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  material.utilizado ? "bg-primary-50 text-primary-700" : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {material.utilizado ? "Gasto" : "A usar"}
              </span>

              {ehAdministrador && (
                <button
                  onClick={() => remover(material)}
                  disabled={atualizandoId === material.id}
                  title="Remover material"
                  className="p-1 rounded text-neutral-300 hover:text-priority-urgente hover:bg-neutral-50 shrink-0 no-print"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {ehAdministrador && (
        <form onSubmit={handleAdicionar} className="mt-4 pt-4 border-t border-neutral-100 space-y-2 no-print">
          {erro && <p className="text-xs text-priority-urgente">{erro}</p>}
          <Select
            value={valores.catalogoId}
            onChange={(e) => setValores((v) => ({ ...v, catalogoId: e.target.value }))}
          >
            <option value="">Escolha o material...</option>
            {catalogo.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
                {m.unidade ? ` (${m.unidade})` : ""}
              </option>
            ))}
            <option value={OUTRO}>Outro (digitar o nome)</option>
          </Select>
          {catalogo.length === 0 && (
            <p className="text-xs text-neutral-400">
              O catálogo está vazio. Cadastre materiais em Administração → Materiais, ou use "Outro".
            </p>
          )}
          <div className="flex gap-2">
            {valores.catalogoId === OUTRO && (
              <div className="flex-1">
                <Input
                  placeholder="Nome do material"
                  value={valores.nome}
                  onChange={(e) => setValores((v) => ({ ...v, nome: e.target.value }))}
                />
              </div>
            )}
            <div className="w-24">
              <Input
                type="number"
                min="1"
                title="Quantidade"
                value={valores.quantidade}
                onChange={(e) => setValores((v) => ({ ...v, quantidade: e.target.value }))}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={valores.utilizado}
              onChange={(e) => setValores((v) => ({ ...v, utilizado: e.target.checked }))}
              className="rounded border-neutral-300 text-primary-500"
            />
            Já foi gasto na resolução do problema
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Observação (opcional)"
                value={valores.observacao}
                onChange={(e) => setValores((v) => ({ ...v, observacao: e.target.value }))}
              />
            </div>
            <Button type="submit" variant="secondary" loading={enviando}>
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
