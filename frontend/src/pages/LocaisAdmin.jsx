import { useEffect, useState } from "react";
import { ShieldAlert, PlusCircle, AlertCircle, MapPin } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/Input";
import Textarea from "../components/Textarea";
import Button from "../components/Button";
import QRCodeCard from "../components/QRCodeCard";
import localService from "../services/local.service";
import { getErrorMessage } from "../utils/getErrorMessage";

const VALORES_INICIAIS = { nome: "", bloco: "", descricao: "" };

export default function LocaisAdmin() {
  const { usuario } = useAuth();

  const [locais, setLocais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState("");

  const [valores, setValores] = useState(VALORES_INICIAIS);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);

  const ehAdministrador = usuario?.role === "ADMINISTRADOR";

  async function carregarLocais() {
    setCarregando(true);
    setErroLista("");
    try {
      const dados = await localService.listarTodos();
      setLocais(dados);
    } catch (err) {
      setErroLista(getErrorMessage(err, "Não foi possível carregar os locais."));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (ehAdministrador) carregarLocais();
  }, [ehAdministrador]);

  function atualizarCampo(campo, valor) {
    setValores((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErroGeral("");

    if (!valores.nome.trim()) {
      setErros({ nome: "Informe o nome do local." });
      return;
    }

    setEnviando(true);
    try {
      await localService.criar(valores);
      setValores(VALORES_INICIAIS);
      await carregarLocais();
    } catch (err) {
      setErroGeral(getErrorMessage(err, "Não foi possível cadastrar o local."));
    } finally {
      setEnviando(false);
    }
  }

  // A API já bloqueia (403) quem não é administrador; esta checagem no
  // frontend é só para não mostrar o formulário/QR Codes por engano.
  // Os hooks acima já foram todos chamados, então este retorno antecipado
  // não viola as Regras dos Hooks.
  if (!ehAdministrador) {
    return (
      <div className="surface-card p-8 max-w-lg flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-priority-urgente/10 text-priority-urgente flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-neutral-900 mb-1">Acesso restrito</h2>
          <p className="text-sm text-neutral-500">
            Somente administradores podem cadastrar locais e gerar QR Codes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div>
        <h2 className="font-display text-lg font-bold text-neutral-900">Locais e QR Codes</h2>
        <p className="text-sm text-neutral-500 mt-0.5">
          Cadastre os ambientes do campus e gere o QR Code que abre o chamado já com o local preenchido.
        </p>
      </div>

      {/* Formulário de cadastro */}
      <form onSubmit={handleSubmit} className="surface-card p-6 space-y-4 max-w-xl">
        <h3 className="font-display font-semibold text-sm text-neutral-800">Novo local</h3>

        {erroGeral && (
          <div className="flex items-start gap-2 bg-priority-urgente/10 text-priority-urgente text-sm rounded-lg px-3 py-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{erroGeral}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="nome"
            label="Nome do local"
            placeholder="Ex: Laboratório 03"
            value={valores.nome}
            onChange={(e) => atualizarCampo("nome", e.target.value)}
            error={erros.nome}
          />
          <Input
            id="bloco"
            label="Bloco"
            placeholder="Ex: Bloco B (opcional)"
            value={valores.bloco}
            onChange={(e) => atualizarCampo("bloco", e.target.value)}
          />
        </div>

        <Textarea
          id="descricao"
          label="Descrição"
          rows={2}
          placeholder="Detalhes que ajudem a localizar o ambiente (opcional)"
          value={valores.descricao}
          onChange={(e) => atualizarCampo("descricao", e.target.value)}
        />

        <div className="flex justify-end">
          <Button type="submit" loading={enviando}>
            <PlusCircle className="w-4 h-4" />
            Cadastrar local
          </Button>
        </div>
      </form>

      {/* Lista de locais + QR Codes */}
      <div>
        <h3 className="font-display font-semibold text-sm text-neutral-800 mb-3">
          Locais cadastrados
        </h3>

        {carregando && <p className="text-sm text-neutral-400">Carregando...</p>}

        {!carregando && erroLista && (
          <p className="text-sm text-priority-urgente">{erroLista}</p>
        )}

        {!carregando && !erroLista && locais.length === 0 && (
          <div className="surface-card p-8 flex flex-col items-center text-center">
            <MapPin className="w-6 h-6 text-neutral-300 mb-2" />
            <p className="text-sm text-neutral-500">Nenhum local cadastrado ainda.</p>
          </div>
        )}

        {!carregando && !erroLista && locais.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {locais.map((local) => (
              <QRCodeCard key={local.id} local={local} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
