# Sistema de Chamados de Manutenção — IFMS Campus Jardim

Protótipo de TCC para automatizar o processo de comunicação de problemas de
infraestrutura entre alunos, servidores e o setor de manutenção do campus.

> **Roadmap original (6 etapas) concluído + evolução do fluxo completo:**
> abertura de chamado sem login via QR Code, status simplificado (Novo →
> Em andamento → Aguardando peças → Concluído), controle de materiais e
> filtro por responsável. Veja a seção "Evolução do fluxo completo"
> abaixo para o detalhamento. `DESIGN_SYSTEM.md` tem os tokens visuais.

## Estrutura do repositório

```
ifms-manutencao/
├── docker-compose.yml   # orquestra backend + frontend (ver "Como rodar com Docker")
├── .env.example         # variáveis do docker-compose (copie para .env)
├── backend/     # API REST (Node + Express + Prisma + SQLite) — tem seu próprio Dockerfile
└── frontend/    # SPA (React + Vite + TailwindCSS) — tem seu próprio Dockerfile
```

### Backend

```
backend/src/
├── config/         # configuração de infraestrutura (ex: cliente Prisma)
├── controllers/     # recebem a requisição HTTP e devolvem a resposta
├── services/         # regras de negócio
├── repositories/       # acesso a dados (Prisma)
├── middlewares/          # auth, tratamento de erros, upload, etc.
└── routes/                 # definição dos endpoints
```

### Frontend

```
frontend/src/
├── components/   # componentes reutilizáveis (Button, Card, Badge...)
├── pages/         # telas (Login, Dashboard, Chamados...)
├── layouts/        # esqueletos de página (sidebar + topbar, etc.)
├── hooks/            # hooks customizados
├── services/          # chamadas HTTP à API
├── contexts/            # estado global (ex: autenticação)
├── routes/                # configuração de rotas (react-router)
├── utils/                  # funções auxiliares
└── types/                    # tipos/JSDoc compartilhados
```

## Pré-requisitos

**Com Docker (recomendado):** Docker e Docker Compose — nada mais.

**Sem Docker:** Node.js 18+ e npm (ver "Como rodar sem Docker" mais abaixo).

## Como rodar com Docker (recomendado)

Essa é a forma mais simples de rodar o projeto inteiro — sobe backend e
frontend já buildados, com o banco SQLite e os anexos persistidos em
volumes do Docker.

```bash
# na raiz do projeto (onde está o docker-compose.yml)
cp .env.example .env      # opcional — os padrões já funcionam
docker compose up --build
```

Espere as duas imagens serem construídas. O backend só fica "healthy"
depois que a API responde em `/api/health`; o frontend só sobe depois disso.

Acesse `http://localhost:5173`. Na primeira vez, popule o banco com os
dados de exemplo (usuários de teste, locais e chamados):

```bash
docker compose exec backend npx prisma db seed
```

Login de teste: `admin@ifms.edu.br` / `admin123` (administrador) e
`aluno@ifms.edu.br` / `usuario123` (usuário).

**Comandos úteis:**

```bash
docker compose up -d              # sobe em segundo plano
docker compose logs -f backend    # acompanha os logs da API
docker compose down               # para os containers (mantém os dados)
docker compose down -v            # para e APAGA os volumes (banco/uploads)
docker compose up --build         # reconstrói as imagens após mudar o código
```

**Como funciona por baixo dos panos:**

- O **backend** (`node:20-slim`) instala as dependências, gera o Prisma
  Client no build, e no start do container roda `prisma db push` para
  sincronizar o schema com o banco (este projeto não versiona uma pasta
  `prisma/migrations`, então `db push` é o caminho certo para SQLite —
  ver comentário em `backend/docker-entrypoint.sh`).
- O **frontend** é buildado com Vite e servido por Nginx. O Nginx faz
  proxy de `/api` e `/uploads` para o container do backend — por isso o
  frontend em produção nem precisa saber o endereço da API, exatamente
  como o proxy do Vite já fazia em desenvolvimento (`vite.config.js`).
  Como o navegador só fala com o Nginx (mesma origem), CORS nem entra
  em jogo nesse cenário.
- O banco SQLite (`backend-data`) e os anexos (`backend-uploads`) ficam
  em volumes nomeados do Docker — sobrevivem a `docker compose down` e
  a rebuilds de imagem.

## Como rodar sem Docker

Se preferir rodar diretamente com Node.js na sua máquina (ex: para usar
o hot-reload do `nodemon`/Vite durante o desenvolvimento):

### Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

A API sobe em `http://localhost:3333`. Teste em `http://localhost:3333/api/health`.

Usuários criados pelo seed:

| Papel | E-mail | Senha |
|---|---|---|
| Administrador | admin@ifms.edu.br | admin123 |
| Usuário | aluno@ifms.edu.br | usuario123 |

O seed também cria 14 chamados de exemplo (variando status, categoria e
prioridade) para o Dashboard já nascer com dados reais para exibir.

### Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173`. As chamadas para `/api` são
redirecionadas automaticamente para o backend (ver `vite.config.js`).

Se tudo estiver certo, a tela inicial deve mostrar "Conexão com a API: OK".

## Endpoints da API

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/api/health` | Verifica se a API está no ar | Não |
| POST | `/api/auth/login` | Autentica com `{ email, senha }` e devolve `{ usuario, token }` | Não |
| GET | `/api/auth/me` | Devolve os dados do usuário autenticado | Sim (Bearer token) |
| GET | `/api/dashboard/resumo` | Indicadores, distribuições por status/categoria/prioridade, chamados recentes e atividades | Sim (Bearer token) |
| GET | `/api/locais` | Lista os ambientes ativos do campus | **Não** — rota pública (formulário sem login) |
| GET | `/api/locais/todos` | Lista todos os locais (inclusive inativos), com bloco e código | Sim, apenas Administrador |
| GET | `/api/locais/codigo/:codigo` | Resolve um local a partir do código do QR Code | **Não** — rota pública, usada no fluxo sem login |
| POST | `/api/locais` | Cadastra um novo local e gera o código do QR Code | Sim, apenas Administrador |
| GET | `/api/chamados` | Lista chamados com filtros (`status`, `categoria`, `prioridade`, `localId`, `responsavelId`, `busca`), paginação (`page`, `pageSize`) e ordenação (`ordenarPor`, `ordem`). Usuário comum só vê os próprios chamados; administrador vê todos | Sim (Bearer token) |
| POST | `/api/chamados` | Abre um novo chamado autenticado. `multipart/form-data` com `titulo`, `descricao`, `categoria`, `prioridade`, `localId` e um campo opcional `imagem` (até 5MB) | Sim (Bearer token) |
| POST | `/api/chamados/publico` | Abre um chamado **sem login** (fluxo do QR Code). `multipart/form-data` com `descricao`, `categoria`, `localCodigo`, `nome`/`contato` opcionais e `imagem` opcional. Título e prioridade são automáticos | **Não** — rota pública |
| GET | `/api/chamados/:id` | Detalhes completos do chamado (anexos, observações, materiais, histórico). Usuário comum só pode ver o próprio chamado | Sim (Bearer token) |
| PATCH | `/api/chamados/:id` | Atualiza `status`, `prioridade` e/ou `responsavelId`. Gera histórico e notificações internas automaticamente | Sim, apenas Administrador |
| POST | `/api/chamados/:id/observacoes` | Adiciona uma observação ao chamado e notifica o solicitante | Sim, apenas Administrador |
| POST | `/api/chamados/:id/materiais` | Registra um material (nome, quantidade, observação, necessário/utilizado) | Sim, apenas Administrador |
| PATCH | `/api/chamados/:id/materiais/:materialId` | Atualiza um material (ex: marcar como utilizado) | Sim, apenas Administrador |
| DELETE | `/api/chamados/:id/materiais/:materialId` | Remove um material | Sim, apenas Administrador |
| GET | `/api/usuarios/administradores` | Lista administradores ativos (usado no select de "Responsável") | Sim, apenas Administrador |
| GET | `/api/notificacoes` | Lista as notificações do usuário logado (`?apenasNaoLidas=true` para filtrar) | Sim (Bearer token) |
| GET | `/api/notificacoes/nao-lidas/contagem` | Contagem de notificações não lidas (usado no sininho do Topbar) | Sim (Bearer token) |
| PATCH | `/api/notificacoes/:id/lida` | Marca uma notificação como lida | Sim (Bearer token) |
| PATCH | `/api/notificacoes/lidas` | Marca todas as notificações do usuário como lidas | Sim (Bearer token) |
| PATCH | `/api/usuarios/me` | Atualiza o próprio nome | Sim (Bearer token) |
| PATCH | `/api/usuarios/me/senha` | Troca a própria senha (`senhaAtual`, `novaSenha`) | Sim (Bearer token) |
| GET | `/api/relatorios/consolidado` | Relatório de gestão do período (`dataInicio`, `dataFim`): tipos de problema, localização, materiais gastos, tempo médio de resolução | Sim, apenas Administrador |

## Funcionalidade: notificações internas

Sempre que o administrador altera o **status**, atribui um **responsável** ou
adiciona uma **observação** em um chamado, uma notificação interna é criada
automaticamente para a pessoa afetada (o solicitante ou o novo responsável —
nunca para quem fez a própria alteração). Elas aparecem no sininho do Topbar,
com contagem de não lidas atualizada a cada 30s, e ao clicar levam direto
para o chamado correspondente.

## Funcionalidade: abertura de chamado por QR Code

Cada local cadastrado tem um **código único** (gerado a partir do nome, ex:
`LABORATORIO-01`) e um QR Code que aponta para `/chamados/novo/:codigo`.

Fluxo: o usuário escaneia o QR fixado no ambiente → cai direto na tela de
"Novo chamado" já com o **local identificado automaticamente** → só precisa
escolher a **categoria**, escrever a **descrição** e, opcionalmente, anexar
uma **foto**. Título e prioridade são preenchidos automaticamente (a
prioridade pode ser reclassificada pelo administrador depois, na triagem).

Se o usuário ainda não estiver logado, o próprio fluxo de autenticação já
existente cuida disso: ele é enviado para o login e, ao entrar, volta
automaticamente para a tela do chamado — nenhuma rota nova de auth foi
necessária para isso.

A tela de **cadastro de locais e impressão dos QR Codes** fica em
`/locais`, visível apenas para o Administrador (link "Locais" no menu
lateral). Os QR Codes são gerados inteiramente no navegador (biblioteca
`qrcode`, sem chamada a nenhuma API externa) e podem ser impressos
individualmente para fixar no ambiente.

> **Atenção ao migrar:** o schema mudou bastante nesta rodada (status
> simplificado, `solicitanteId` opcional, model `Material` novo). Se você
> já tinha um `dev.db` de uma versão anterior, apague-o antes de migrar
> de novo — é mais simples do que tentar preservar dados de teste:
> ```bash
> # dentro de backend/
> rm prisma/dev.db
> rm -rf prisma/migrations
> npx prisma migrate dev --name fluxo_completo_sem_login
> npx prisma db seed
> ```

## Evolução do fluxo completo (sem login → materiais → relatório)

Esta seção documenta as mudanças feitas para o fluxo completo:
`QR Code → abertura sem login → gerenciamento → execução → materiais → conclusão → relatório`.

### Decisões estruturais tomadas (com aprovação prévia)

1. **`Chamado.solicitanteId` agora é opcional.** Um chamado pode não ter
   nenhum `Usuario` vinculado — é o que acontece na abertura sem login.
   Nesse caso, `solicitanteNome`/`solicitanteContato` (ambos opcionais,
   texto livre) guardam a identificação informada por quem abriu, se
   quiser deixar. `HistoricoChamado.autorId` e `Anexo.enviadoPorId`
   também viraram opcionais pela mesma razão (uma ação anônima não tem
   um `Usuario` autor).
2. **Status simplificado para 4 etapas:** `NOVO → EM_ANDAMENTO →
   AGUARDANDO_PECAS → CONCLUIDO`, substituindo o fluxo anterior de 7
   etapas. Se você já tinha um `dev.db` de uma versão anterior, ele
   precisa ser recriado (ver seção de migração abaixo).
3. **RBAC continua com 2 papéis** (`USUARIO`/`ADMINISTRADOR`) por
   decisão explícita — os papéis `TECNICO`/`GESTOR` do escopo ficaram
   para uma próxima etapa. As permissões de "Técnico" (materiais,
   observações, mudança de status) estão, por enquanto, sob
   `ADMINISTRADOR`.

### Abertura de chamado sem login

- **Rota pública do frontend:** `/chamado?local=CODIGO` — fora do
  `ProtectedRoute` de propósito. É para lá que os QR Codes gerados em
  `/locais` agora apontam.
- **Rota pública do backend:** `POST /api/chamados/publico` — não passa
  pelo middleware `autenticar`. Só pede categoria + descrição (+ foto
  opcional); nome/contato são opcionais. Título é gerado automaticamente
  e a prioridade nasce em `MEDIA` — quem abre o chamado nunca escolhe a
  prioridade, só a administração define isso depois.
- **Auditoria:** o IP de quem abriu fica em `Chamado.ipAbertura`, sem
  coletar mais nenhum dado técnico.
- A abertura autenticada (`/chamados/novo`, para quem está logado)
  continua funcionando exatamente como antes.

### Materiais

Model `Material` novo, relacionado ao chamado: nome, quantidade,
observação, `necessario` e `utilizado`. Gerenciado na própria tela de
detalhes do chamado (componente `MateriaisChamado`), só pelo
administrador. Cada material adicionado gera um evento
`MATERIAL_REGISTRADO` na linha do tempo.

### Dashboard e filtros

- Indicadores agora mostram os 4 status individualmente (Novos, Em
  andamento, Aguardando peças, Concluídos), além do total.
- Novo gráfico "Chamados por local".
- Novo filtro por responsável na tela de Chamados (só para admin).
- A tela de Chamados já abre com o filtro **Novos** pré-selecionado
  (um clique em "Todos os status" mostra tudo).

### Relatório do chamado e exportação em PDF

A tela de detalhes do chamado **é** o relatório: reúne número, data de
abertura, local, descrição, categoria, prioridade, status, responsável,
materiais (necessários e utilizados), observações, histórico completo e
data de conclusão.

O botão **Exportar PDF** usa a impressão do navegador (`window.print()`)
com um CSS de impressão dedicado (ver `frontend/src/index.css`): na
folha, some tudo que é navegação e controle de edição (menu lateral,
topo, painel "Gerenciar", formulários) e entra um cabeçalho
institucional com a data de emissão. O usuário escolhe "Salvar como PDF"
no diálogo de impressão.

Escolhemos essa abordagem em vez de gerar o PDF no servidor porque não
exige nenhuma biblioteca nova, nenhuma rota adicional e nenhuma mudança
de arquitetura — o relatório na tela e o PDF nunca saem de sincronia,
já que são literalmente o mesmo componente.

### Usuário comum sem conta (acesso público)

O usuário comum **não precisa de conta em momento nenhum**. Há dois
caminhos, ambos sem login:

- **Com QR Code:** `/chamado?local=CODIGO` — o ambiente já vem
  identificado pelo código do QR fixado na parede.
- **Sem QR Code:** `/chamado` — a pessoa escolhe o ambiente numa lista.
  É também para onde a raiz do site (`/`) redireciona, já que essa é a
  porta de entrada da maioria dos usuários.

A tela de login tem um link destacado ("Abrir chamado sem login") e a
página pública tem um link discreto de volta para o login, usado só
pela equipe de manutenção. Para isso funcionar, `GET /api/locais` e
`GET /api/locais/codigo/:codigo` são rotas públicas — expõem apenas
nomes de salas do campus, nada sensível.

As contas de login continuam existindo para a **administração** (e a
conta de usuário comum segue funcionando para quem quiser acompanhar os
próprios chamados e receber notificações — mas isso é opcional, não é
mais pré-requisito para comunicar um problema).

### Relatório consolidado (gestão)

Além do relatório individual de cada chamado, a administração tem em
**Relatórios** (`/relatorios`, no menu lateral) uma visão agregada do
período, com filtro por data e exportação em PDF:

- **Indicadores:** total de chamados, em aberto, taxa de conclusão e
  **tempo médio de resolução** (em dias).
- **Tipos de problema:** distribuição por categoria, com percentual.
- **Localização:** tabela por ambiente, com total e concluídos.
- **Materiais gastos:** consolidado por material, somando quantidade
  **solicitada** e **utilizada** e em quantos chamados apareceu — a
  distinção entre os dois importa para a gestão (previsão x consumo real).
- **Situação e prioridades:** distribuição por status e por prioridade.

Endpoint: `GET /api/relatorios/consolidado?dataInicio=&dataFim=`
(apenas Administrador).

### Categorias de chamados e catálogo de materiais

Em **Administração** (menu lateral, só ADMINISTRADOR):

- **Categorias de chamados** — criar, renomear, ativar/desativar e excluir
  (só se não estiver em uso; em uso, desative). O formulário dos QR Codes
  oferece **somente as ativas**. Elétrica, Hidráulica etc. são criadas na
  primeira inicialização da API, apenas se a tabela estiver vazia.
  `Chamado.categoria` guarda um código de texto (sem FK), então chamados
  antigos nunca perdem a categoria. Nomes duplicados são recusados
  (ignorando maiúsculas, acentos e espaços).
- **Materiais** — catálogo com **adicionar, editar e remover**
  (nome + unidade opcional). No detalhe de cada chamado, o administrador
  escolhe o material no catálogo, informa a quantidade e marca se já foi
  **gasto** na resolução (ou só "a usar"); há também a opção "Outro"
  para digitar um material fora do catálogo. Renomear no catálogo atualiza
  os registros dos chamados; remover do catálogo **não apaga** o histórico
  (os chamados mantêm o nome do material). Não é controle de estoque.
  Os materiais gastos alimentam o **Relatório consolidado**.

**Atualizando um banco existente (sem apagar dados):** só tabelas novas
e uma coluna opcional em `Material`.

```bash
# dentro de backend/  — NÃO rode `db seed` (ele recria os chamados de exemplo)
npx prisma migrate dev --name categorias_e_materiais     # ou: npx prisma db push
npm run dev
```
Com Docker: `docker compose up --build` (o entrypoint já aplica o schema).
Se você já aplicou a versão anterior (v1.2), a tabela
`categorias_material` — que só tinha as 6 categorias padrão — será
removida; o Prisma pedirá confirmação por isso.

Endpoints (Administrador): `/api/categorias-chamado` (`GET` é público) e
`/api/materiais` — `GET`, `POST`, `PATCH /:id`, `DELETE /:id`.

### O que ficou para a próxima etapa

Papéis Técnico/Gestor e os itens já listados na seção "O que NÃO
implementar agora" do escopo (n8n, WhatsApp, e-mail automático, IA,
estoque avançado, etc).

## Stack técnica

- **Frontend:** React + Vite, TailwindCSS, React Router, Recharts (gráficos), Lucide React (ícones), qrcode (geração de QR Codes 100% local)
- **Backend:** Node.js, Express, Prisma ORM
- **Banco de dados:** SQLite (protótipo — arquitetura preparada para migrar para PostgreSQL/MySQL no futuro)
- **Autenticação:** JWT
- **Infraestrutura:** Docker + Docker Compose (backend em Node, frontend buildado e servido por Nginx com proxy reverso para a API)

## Roadmap de etapas

1. ✅ Fundação do projeto (estrutura, banco de dados, setup base)
2. ✅ Autenticação e identidade visual (login, JWT, layout com sidebar/topbar, design system aplicado)
3. ✅ Dashboard (indicadores, gráficos por status/categoria/prioridade, chamados recentes, atividades)
4. ✅ Abertura e listagem de chamados (formulário com anexo de imagem, filtros, busca, paginação)
5. ✅ Detalhes e edição de chamado (status/prioridade/responsável, observações, linha do tempo, notificações internas)
6. ✅ Perfil (editar nome, trocar senha), Configurações (conta, atalhos, sobre o sistema) e refinamentos finais (menu lateral responsivo com drawer mobile)
7. ✅ QR Code por local (cadastro de ambientes + geração/impressão dos códigos)
8. ✅ Fluxo completo: abertura sem login, status simplificado, materiais, filtro por responsável
9. ✅ Containerização com Docker e Docker Compose
10. ✅ Exportação do relatório do chamado em PDF
11. ✅ Acesso 100% sem conta para o usuário comum + relatório consolidado de gestão

## Roteiro de demonstração (para a banca)

Este roteiro percorre o fluxo completo do sistema, na ordem, e cobre os
critérios de aceitação do projeto.

**Preparação:** `docker compose up --build`, depois
`docker compose exec backend npx prisma db seed`.

1. **Gerar o QR Code.** Entre como administrador
   (`admin@ifms.edu.br` / `admin123`) → menu **Locais** → cada ambiente
   já tem seu QR Code, com botão de imprimir. Copie o link de um deles
   (ex: `http://localhost:5173/chamado?local=LABORATORIO-01`).
2. **Abrir um chamado sem login.** Abra esse link em uma **aba anônima**
   (para provar que não há sessão ativa) — ou escaneie o QR impresso com
   o celular. O local já aparece identificado; preencha categoria +
   descrição, anexe uma foto e envie. O sistema devolve o número do chamado.
3. **Triagem.** De volta na conta do administrador → **Chamados**. Note
   que a tela já abre filtrada em **Novos**. O chamado recém-criado está lá.
4. **Gerenciar.** Abra o chamado → no painel lateral **Gerenciar**,
   defina a **prioridade** (só a administração pode) e atribua um
   **responsável**. Mude o status para **Em andamento**.
5. **Execução e materiais.** Registre os materiais necessários na seção
   **Materiais**; marque como utilizados conforme forem usados. Se
   faltar peça, mude o status para **Aguardando peças**.
6. **Conclusão.** Adicione uma observação final e mude o status para
   **Concluído**.
7. **Relatório e rastreabilidade.** A própria tela de detalhes é o
   relatório: número, local, descrição, categoria, prioridade, status,
   responsável, materiais, observações, **linha do tempo completa** e
   data de conclusão. Clique em **Exportar PDF** para gerar o documento
   final (escolha "Salvar como PDF" no diálogo de impressão).
8. **Indicadores.** Volte ao **Dashboard** e mostre os números
   atualizados: total, novos, em andamento, aguardando peças, concluídos,
   além dos gráficos por categoria, prioridade e local.
9. **Notificações.** Se o chamado tiver sido aberto por um usuário logado
   (`aluno@ifms.edu.br` / `usuario123`), entre com essa conta e mostre o
   sininho com as notificações de mudança de status.
