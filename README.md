# TaskLab: entrega final (Sábados 1 e 3)

Gerenciador de tarefas em Vue 3 que reúne os desafios do Sábado 1 e os exercícios do Sábado 3: lista com filtros
combinados, store compartilhada, indicadores, persistência, rotas, edição e recursos de IA com aprovação.

## Identificação

- **Integrante:** Paulo Gustavo Campos de Siqueira
- **Turma / disciplina:** Vue

## Tecnologia escolhida

- **Vue 3** (Composition API com `<script setup>`) e **Vite 6**
- **Pinia**, como gerenciador de estado (setup store em `src/stores/tarefas.js`)
- **Vue Router 4**
- Proxy da IA em **Node.js**, sem dependências (`server/proxy.mjs`), usado em **modo simulado**

## Estrutura das pastas

```
tasklab-final/
├── README.md              este arquivo (com a checklist)
├── server/                proxy local da IA (fica AO LADO do app)
│   ├── proxy.mjs          rotas /api/quebrar, /api/agir (e /api/filtrar, legado do bloco 6)
│   └── repositorio.mjs    persistência usada só pela demo de MCP (não usada aqui)
└── tasklab/               aplicação Vue
    ├── package.json, package-lock.json, vite.config.js, index.html
    └── src/
        ├── main.js            cria o app com Pinia e Router
        ├── App.vue            casca: menu, estados de carregamento/erro e <RouterView>
        ├── stores/tarefas.js  store Pinia: state, getters e actions
        ├── router/index.js    rotas /, /resumo, /tarefa/:id e 404
        ├── views/             ListaView, ResumoView, TarefaView, NaoEncontradaView
        ├── components/        TaskForm, TaskItem, ListaTarefas, FiltrosTarefas, ResumoTarefas,
        │                      PassosSugeridos, ComandosIA, BasePanel
        ├── composables/useFiltrosUrl.js   lê e grava busca/situação na query da URL
        ├── services/ia.js     única camada que fala com o proxy
        └── utils/             filtros, armazenamento (localStorage), sanitizar, acoes (lista permitida)
```

## Como instalar e executar

Pré-requisito: **Node 20 ou mais novo**.

### 1. Aplicação

```bash
cd tasklab
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite (normalmente `http://localhost:5173`).

### 2. Proxy da IA, em modo simulado (outro terminal)

O proxy fica em `server/`, **ao lado** da pasta `tasklab/`. Portanto, de dentro de `tasklab/`, o caminho é
`../server/proxy.mjs`:

```bash
# Git Bash / Linux / macOS
cd tasklab
USAR_MOCK=1 node ../server/proxy.mjs
```

```powershell
# PowerShell
cd tasklab
$env:USAR_MOCK=1; node ../server/proxy.mjs
```

O proxy escuta em `http://127.0.0.1:3001`, e o Vite repassa tudo que começa com `/api` para ele (`vite.config.js`).
O modo simulado não precisa de chave nem de internet. Sem o proxy, o app funciona normalmente; só os recursos de IA
mostram uma mensagem de erro.

### 3. Build e preview

```bash
cd tasklab
npm run build
npm run preview      # http://localhost:4173 (o /api também é repassado ao proxy no preview)
```

## Funcionalidades

### Sábado 1: lista e filtros

| Desafio | Como foi feito |
|---|---|
| 1. Contar pendentes | `totalPendentes` é um getter (`computed`) da store, exibido na lista e no menu. |
| 2. Buscar por título | `aplicarFiltro` compara em minúsculas com `includes`; busca vazia não restringe. |
| 3. Filtrar por situação | `<select>` com Todas, Pendentes e Concluídas. |
| 4. Combinar filtros | Uma única função (`utils/filtros.js`) exige texto **e** situação. |
| 5. Preservar dados | A lista exibida é um `computed` derivado; `tarefas` da store nunca é alterada pelo filtro. |
| 6. Limpar filtros | Botão "Limpar filtros" (`@click`) zera a busca e volta para Todas, mexendo só na URL. |
| 7. Mensagens de vazio | `v-if` / `v-else-if`: "Nenhuma tarefa cadastrada" observa a lista real; "Nenhuma tarefa corresponde aos filtros" observa a filtrada. Nunca aparecem juntas. |

Também é possível cadastrar (com validação de título vazio), concluir, reabrir (checkbox) e remover (botão em cada item
e na tela de detalhe).

### Sábado 3

- **cp-01/02: store e resumo.** Getters `concluidas`, `totalConcluidas` e `percentualConcluido` (arredondado; 0% sem
  tarefas). Lista e Resumo leem a mesma store, sem props entre irmãos. Formulário e item usam props e eventos.
- **cp-03: persistência.** `watch` profundo salva no `localStorage`. Ao abrir, os dados são validados. Os estados
  `ocioso`, `carregando`, `erro` e `sucesso` aparecem na tela (`role="status"` / `role="alert"`), com botão
  **Tentar de novo**. Dados corrompidos são descartados com mensagem e a nova tentativa recupera a lista inicial. A
  action `limparConcluidas` remove as concluídas e persiste.
- **cp-04: rotas.** `/` (lista), `/resumo`, `/tarefa/:id` e 404. Busca e situação ficam na query
  (`?busca=...&filtro=...`); valores inválidos viram "todas". No Resumo, o link **Ver só as pendentes** leva a
  `/?filtro=pendentes`.
- **cp-05: detalhe.** Edição em rascunho local, **Salvar**, **Cancelar** e **Remover** (volta à lista). O guarda
  `onBeforeRouteLeave` pede confirmação ao sair com alterações não salvas; recusar cancela a navegação.
- **cp-06: sugestões com IA.** "Quebrar em passos" e **Adicionar todos**: a action `aceitarTodas` chama `adicionar`
  para cada sugestão e depois limpa a lista de sugestões.
- **cp-06b: assistente com aprovação.** O pedido vira um plano descrito em texto, com **Fazer**, **Fazer tudo** e
  **Descartar**. Só enviar o pedido não altera nada. Lista permitida: `adicionar`, `alternar`, `editar` e `filtrar`
  (remoção fica de fora). A ação **editar** valida se o id existe e se o título é válido, aparece no plano como
  `Renomear "X" para "Y"` e roda pela action `editar` da store, só depois da aprovação.

## Decisões técnicas

- **Por que as tarefas ficam na store:** Lista, Resumo, Detalhe, menu e assistente precisam dos mesmos dados. Com
  uma única fonte de verdade não há cópias que se desencontram e toda alteração passa por actions. Os indicadores são
  getters derivados e se atualizam sozinhos.
- **Por que os filtros ficam na URL:** o estado do filtro vira um endereço que pode ser compartilhado, recarregado,
  aberto em outra aba ou navegado com voltar/avançar. A store guarda os dados; a URL guarda **como** vê-los. Por isso o
  link "Ver só as pendentes" e o assistente apenas navegam.
- **Por que a IA passa pelo proxy:** a chave de API nunca pode chegar ao navegador nem ao repositório. O proxy valida
  o tamanho e o formato da entrada, chama a IA (ou o simulador) e devolve só JSON. Como o Vite repassa `/api`, não é
  preciso abrir CORS. No frontend, `services/ia.js` valida de novo a resposta (`sanitizar`, `validarAcoes`), e tudo é
  exibido com interpolação `{{ }}`, nunca com `v-html`.
- **Ids entre app e proxy:** o `server.zip` mais recente usa ids em texto (`"2"`), e o app usa números (`2`).
  `services/ia.js` converte na ida (`String(id)`) e na volta (só ids feitos apenas de dígitos), e a validação de
  `utils/acoes.js` continua exigindo inteiros que existam na lista.
- **"Todas" e a busca:** o desafio do Sábado 1 diz que "Todas" mostra tudo independente da busca, mas o roteiro final
  define a regra integrada: **Todas retira só a restrição de situação e mantém a busca; Limpar filtros retira as duas**.
  O projeto segue o roteiro final.
- **Remover com rascunho alterado:** ao remover pela tela de detalhe, o aviso de saída não aparece, porque a tarefa
  deixou de existir e não há edição a perder.
- O `vite.config.js` também configura o proxy de `/api` no `preview`, para testar a IA com o build.

## Limitações

- Os dados ficam só no `localStorage` do navegador (sem backend de tarefas).
- O modo simulado entende frases simples, separadas por "e", vírgula ou ponto e vírgula (ex.: "adicione X e mostre
  as pendentes", "renomeie a tarefa 2 para Y"). O modo real exige `ANTHROPIC_API_KEY` definida **só no ambiente do
  terminal** do proxy e não foi usado nesta entrega.
- O assistente aceita no máximo 3 ações por pedido.
- A demonstração de MCP não faz parte desta entrega (orientação da atividade).

## Checklist da entrega

- [x] **Sábado 1:** os sete desafios estão implementados.
- [x] **Sábado 3:** store, indicadores e percentual funcionam (3 tarefas com 1 concluída = 33%; sem tarefas = 0%).
- [x] Persistência, limpar concluídas e recuperação de erros funcionam (5 tarefas com 2 concluídas → 3, e continuam 3
      após recarregar; JSON corrompido → erro → Tentar de novo → lista inicial).
- [x] Rotas, filtros na URL e link para pendentes funcionam (404 para endereço inexistente e para `/tarefa/abc`;
      "Tarefa não encontrada" para id inexistente; `?filtro=bobagem` vira Todas).
- [x] Detalhe, edição, cancelamento, remoção e aviso de saída funcionam.
- [x] Adicionar todos (4 sugestões → 4 tarefas, lista de sugestões vazia) e assistente com edição aprovada funcionam;
      "Apague tudo" e ids inexistentes são descartados.
- [x] `npm run build` sem erros e testes no `npm run preview` concluídos.
- [ ] Revisão de acessibilidade **manual** por teclado (foco visível já está no CSS; rótulos, `role="status"` e
      `role="alert"` estão presentes). _Marcar após testar._
- [ ] Revisão por outra pessoa/dupla. _Pendente: confirmar com o professor, pois a atividade é individual._
- [x] README e checklist acompanham o código, sem `node_modules` nem segredos.

### Problemas encontrados e corrigidos

| Problema | Correção |
|---|---|
| O proxy do `server.zip` exige ids em texto e o app envia números: o assistente recebia erro 400. | Conversão de ids em `services/ia.js`, mantendo a validação estrita no app. |
| O `npm run preview` não repassava `/api` ao proxy, então a IA falhava no build. | `preview.proxy` no `vite.config.js`. |
| Ao remover uma tarefa no detalhe com o rascunho alterado, o aviso de saída poderia aparecer. | `alterado` só é verdadeiro quando a tarefa existe. |
| Faltavam "Limpar filtros", remover direto na lista e os textos exigidos nas mensagens de vazio. | Implementados em `FiltrosTarefas.vue`, `TaskItem.vue` e `ListaTarefas.vue`. |
