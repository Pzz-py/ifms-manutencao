# Sistema de Design — Manutenção IFMS Campus Jardim

Referência rápida para manter consistência visual nas próximas etapas.
Os tokens já estão implementados em `frontend/tailwind.config.js`.

## Cores

| Papel | Token | Uso |
|---|---|---|
| Marca / ação primária | `primary-500` `#248C57` | Botões primários, links de destaque, ícone do app |
| Apoio / informativo | `accent-500` `#3A7EAF` | Links secundários, gráficos, estados informativos |
| Fundo da aplicação | `neutral-50` `#FAFAFA` | Fundo geral das telas |
| Superfície (cards) | branco `#FFFFFF` | Cards, modais, inputs |
| Texto principal | `neutral-800` | Títulos e corpo de texto |
| Texto secundário | `neutral-500` | Legendas, metadados |
| Bordas | `neutral-200` | Divisores, contornos de card |

### Status do chamado (cada um com cor própria)
`novo` → `recebido` → `emAnalise` → `emAtendimento` → `aguardandoPecas` → `concluido` → `fechado`

### Prioridade
`baixa` (azul) · `media` (âmbar) · `alta` (laranja) · `urgente` (vermelho)

## Tipografia

- **Display** (`font-display` — Plus Jakarta Sans): títulos, números de chamado em destaque, KPIs do dashboard.
- **Sans** (`font-sans` — Inter): texto de interface, formulários, tabelas.
- **Mono** (`font-mono` — JetBrains Mono): números de chamado, códigos, dados tabulares densos.

## Princípios de UI

- Muito espaço em branco, sem telas poluídas.
- Cards com `shadow-card` (sombra suave) e `rounded-xl`.
- Animações discretas (`animate-fade-in`), nunca chamativas.
- Um badge de cor sólida por status/prioridade — nunca dois códigos de cor para o mesmo conceito.
- Estados de vazio e erro sempre explicam o que aconteceu e o que fazer a seguir (nunca apenas "algo deu errado").
