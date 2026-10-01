/**
 * Design tokens do sistema de chamados — IFMS Campus Jardim.
 *
 * Paleta: branco / cinza claro como base neutra, verde institucional
 * como cor de marca/ação principal, e azul discreto como cor de apoio
 * (links, estados informativos, gráficos). As cores de status e
 * prioridade são propositalmente distintas entre si para leitura
 * rápida em listas e no dashboard.
 */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Verde institucional - cor de marca e ações primárias
        primary: {
          50: "#EAF7F0",
          100: "#CDEBDA",
          200: "#9DD7B7",
          300: "#6BBF92",
          400: "#3FA672",
          500: "#248C57", // base
          600: "#1B7A4A",
          700: "#166140",
          800: "#124B32",
          900: "#0E3A27",
        },
        // Azul discreto - apoio, links, estados informativos
        accent: {
          50: "#EEF5FA",
          100: "#D3E6F2",
          200: "#A7CCE5",
          300: "#7BB2D8",
          400: "#5698C9",
          500: "#3A7EAF", // base
          600: "#2D648C",
          700: "#234E6E",
          800: "#1A3B53",
          900: "#122A3B",
        },
        // Neutros - fundo, bordas, texto
        neutral: {
          50: "#FAFAFA",
          100: "#F4F5F6",
          200: "#E7E9EC",
          300: "#D5D8DD",
          400: "#AEB4BC",
          500: "#868E98",
          600: "#5E6672",
          700: "#434B56",
          800: "#2B313A",
          900: "#181C21",
        },
        // Cores de status do chamado - uma cor distinta por etapa do fluxo
        // (fluxo simplificado: Novo -> Em andamento -> Aguardando peças -> Concluído)
        status: {
          novo: "#3A7EAF",             // azul — acabou de entrar
          emAndamento: "#F59E0B",      // âmbar — em execução
          aguardandoPecas: "#F97316",  // laranja — bloqueado externamente
          concluido: "#248C57",        // verde institucional — resolvido
        },
        // Cores de prioridade - escala de urgência
        priority: {
          baixa: "#3A7EAF",
          media: "#F59E0B",
          alta: "#F97316",
          urgente: "#DC2626",
        },
      },
      fontFamily: {
        // Display: usada em títulos, números de chamado em destaque e KPIs do dashboard.
        display: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        // Body: texto de interface, formulários, tabelas — priorizando legibilidade.
        sans: ["Inter", "system-ui", "sans-serif"],
        // Utility: números de chamado, códigos e dados tabulares densos.
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(24, 28, 33, 0.04), 0 2px 8px rgba(24, 28, 33, 0.06)",
        "card-hover": "0 2px 4px rgba(24, 28, 33, 0.06), 0 8px 24px rgba(24, 28, 33, 0.10)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.18s ease-out",
      },
    },
  },
  plugins: [],
};
