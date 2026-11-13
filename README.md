# node-mastra

Servidor Express com [Mastra](https://mastra.ai) para consultar o clima e sugerir atividades. O agent busca a previsão atual; o workflow monta um plano a partir dessa previsão.

## O que tem aqui

- **Weather Agent** (`weatherAgent`): responde sobre o clima de uma cidade e sugere atividades. Usa memória e a tool `weatherTool`.
- **weatherTool**: geocodifica a cidade e busca temperatura, sensação térmica, umidade, vento e condição na [Open-Meteo](https://open-meteo.com/).
- **Weather Workflow** (`weatherWorkflow`): busca a previsão (`fetch-weather`) e pede ao agent um plano de atividades (`plan-activities`).
- **Storage**: LibSQL no arquivo local `mastra.db` (ou Turso, se as variáveis estiverem definidas). Observabilidade vai para o DuckDB.
- **API**: rotas do Mastra em `/api`, spec OpenAPI em `/api/openapi.json` e Swagger UI em `/swagger-ui`.

## Requisitos

- Node.js 20 ou superior
- Uma chave da OpenAI (`OPENAI_API_KEY`), usada pelo modelo `openai/gpt-6.1-sol`

## Como rodar

```bash
npm install
npm run dev
```

O servidor sobe em `http://localhost:4111`.

## Variáveis de ambiente

Crie um arquivo `.env` na raiz. Nunca commite chaves reais.

| Variável | Obrigatória | Uso |
| --- | --- | --- |
| `OPENAI_API_KEY` | sim | Autentica o modelo do agent |
| `PORT` | não | Porta do Express. Padrão: `4111` |
| `TURSO_DATABASE_URL` | não | Banco LibSQL hospedado. Sem ela, usa `file:./mastra.db` |
| `TURSO_AUTH_TOKEN` | não | Token do Turso, quando `TURSO_DATABASE_URL` aponta para um banco remoto |
| `MASTRA_PLATFORM_ACCESS_TOKEN` | não | Envia traces para a [Mastra Platform](https://projects.mastra.ai) |
| `MASTRA_PROJECT_ID` | não | Projeto na Mastra Platform |

## Rotas

| Método | Caminho | Resposta |
| --- | --- | --- |
| `GET` | `/` | `{ "message": "Hello, World!" }` |
| `GET` | `/early-health` | `{ "status": "ok" }`, registrada antes do middleware do Mastra |
| `GET` | `/custom` | Nome do `weatherAgent`, lido de `res.locals.mastra` |
| `GET` | `/api/openapi.json` | Spec OpenAPI das rotas do Mastra |
| `GET` | `/swagger-ui/` | Swagger UI |

Agents e workflows ficam sob o prefixo `/api`. A lista completa está no Swagger UI: `http://localhost:4111/swagger-ui/`.

## Estrutura

```text
src/
  index.ts                         # Express, MastraServer e Swagger UI
  mastra/
    index.ts                       # Registro do agent, workflow, storage e observability
    agents/weather-agent.ts
    tools/weather-tool.ts
    workflows/weather-workflow.ts
```

Agents, tools e workflows novos entram em `src/mastra/` e precisam ser registrados em `src/mastra/index.ts`.

## Licença

MIT
