import {
  Zap,
  Droplet,
  Monitor,
  Armchair,
  Snowflake,
  Building2,
  PaintBucket,
  Sparkles,
  MoreHorizontal,
  Tag,
} from "lucide-react";

/**
 * Cores escolhidas por associação com o tipo de problema (não são
 * arbitrárias): elétrica remete a energia/amarelo, hidráulica a água/azul,
 * informática a tecnologia/violeta, ar-condicionado a temperatura/ciano etc.
 * Isso ajuda o usuário a reconhecer a categoria pela cor mesmo sem ler o rótulo.
 */
export const CATEGORIA_CONFIG = {
  ELETRICA: { label: "Elétrica", color: "#F59E0B", icon: Zap },
  HIDRAULICA: { label: "Hidráulica", color: "#3A7EAF", icon: Droplet },
  INFORMATICA: { label: "Informática", color: "#8B5CF6", icon: Monitor },
  MOBILIARIO: { label: "Mobiliário", color: "#A16207", icon: Armchair },
  AR_CONDICIONADO: { label: "Ar-condicionado", color: "#06B6D4", icon: Snowflake },
  ESTRUTURA: { label: "Estrutura", color: "#64748B", icon: Building2 },
  PINTURA: { label: "Pintura", color: "#D946EF", icon: PaintBucket },
  LIMPEZA: { label: "Limpeza", color: "#14B8A6", icon: Sparkles },
  OUTROS: { label: "Outros", color: "#94A3B8", icon: MoreHorizontal },
};

export const ORDEM_CATEGORIA = [
  "ELETRICA",
  "HIDRAULICA",
  "INFORMATICA",
  "MOBILIARIO",
  "AR_CONDICIONADO",
  "ESTRUTURA",
  "PINTURA",
  "LIMPEZA",
  "OUTROS",
];

/**
 * As categorias agora são geridas no banco. Este mapa continua dando
 * ícone/cor às categorias originais; categorias novas (criadas pelo
 * administrador) caem em um visual neutro padrão.
 * `nome` (vindo da API) tem prioridade sobre o rótulo fixo.
 */
export function infoCategoria(codigo, nome) {
  const base = CATEGORIA_CONFIG[codigo];
  return {
    label: nome || base?.label || codigo,
    color: base?.color || "#64748B",
    icon: base?.icon || Tag,
  };
}
