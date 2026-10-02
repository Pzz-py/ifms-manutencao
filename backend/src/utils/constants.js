/**
 * Constantes de domínio.
 *
 * O SQLite (usado neste protótipo) não é suportado pelo Prisma para
 * o tipo "enum" nativo — o schema.prisma usa String nesses campos.
 * Este arquivo é a fonte única de verdade para os valores permitidos,
 * usada tanto para validação nos services quanto para não duplicar
 * essas listas em vários lugares do backend.
 *
 * Caso o banco migre para PostgreSQL/MySQL no futuro, estes valores
 * podem virar enums nativos no schema.prisma sem mudar esta camada.
 */

const ROLES = Object.freeze({
  USUARIO: "USUARIO",
  ADMINISTRADOR: "ADMINISTRADOR",
});

const CATEGORIAS = Object.freeze({
  ELETRICA: "ELETRICA",
  HIDRAULICA: "HIDRAULICA",
  INFORMATICA: "INFORMATICA",
  MOBILIARIO: "MOBILIARIO",
  AR_CONDICIONADO: "AR_CONDICIONADO",
  ESTRUTURA: "ESTRUTURA",
  PINTURA: "PINTURA",
  LIMPEZA: "LIMPEZA",
  OUTROS: "OUTROS",
});

const PRIORIDADES = Object.freeze({
  BAIXA: "BAIXA",
  MEDIA: "MEDIA",
  ALTA: "ALTA",
  URGENTE: "URGENTE",
});

// Fluxo simplificado a pedido do orientador do TCC: NOVO -> EM_ANDAMENTO ->
// AGUARDANDO_PECAS -> CONCLUIDO. Substituiu o fluxo anterior de 7 etapas
// (RECEBIDO, EM_ANALISE, EM_ATENDIMENTO e FECHADO foram removidos).
const STATUS_CHAMADO = Object.freeze({
  NOVO: "NOVO",
  EM_ANDAMENTO: "EM_ANDAMENTO",
  AGUARDANDO_PECAS: "AGUARDANDO_PECAS",
  CONCLUIDO: "CONCLUIDO",
});

const TIPOS_EVENTO = Object.freeze({
  ABERTURA: "ABERTURA",
  MUDANCA_STATUS: "MUDANCA_STATUS",
  MUDANCA_PRIORIDADE: "MUDANCA_PRIORIDADE",
  MUDANCA_RESPONSAVEL: "MUDANCA_RESPONSAVEL",
  OBSERVACAO: "OBSERVACAO",
  ANEXO_ADICIONADO: "ANEXO_ADICIONADO",
  MATERIAL_REGISTRADO: "MATERIAL_REGISTRADO",
  CONCLUSAO: "CONCLUSAO",
});

const TIPOS_NOTIFICACAO = Object.freeze({
  STATUS_ALTERADO: "STATUS_ALTERADO",
  CHAMADO_ATRIBUIDO: "CHAMADO_ATRIBUIDO",
  NOVA_OBSERVACAO: "NOVA_OBSERVACAO",
  CHAMADO_CONCLUIDO: "CHAMADO_CONCLUIDO",
});

/**
 * Verifica se um valor pertence ao conjunto de um "enum" de aplicação.
 * Ex: ehValorValido(PRIORIDADES, "ALTA") -> true
 */
function ehValorValido(enumObjeto, valor) {
  return Object.values(enumObjeto).includes(valor);
}

module.exports = {
  ROLES,
  CATEGORIAS,
  PRIORIDADES,
  STATUS_CHAMADO,
  TIPOS_EVENTO,
  TIPOS_NOTIFICACAO,
  ehValorValido,
};
