# BillionsMind

Aplicação estática do BillionMind AI com conjunto de rotas backend leves para login, planos, histórico e integrações com OpenAI/Supabase.

## Requisitos
- Node.js 18 ou superior (usa `fetch` nativo, sem dependências externas).
- Variáveis de ambiente configuradas para os serviços externos.

### Variáveis de ambiente
Crie um arquivo `.env` (ou exporte no shell) contendo:

```
PORT=3000
OPENAI_API_KEY=coloque_sua_chave
SUPABASE_URL=https://<sua-instancia>.supabase.co
SUPABASE_ANON_KEY=chave_anon
STRIPE_CHECKOUT_URL=https://link_da_sessao_de_checkout (opcional)
```

## Como rodar
1. Inicie o servidor HTTP/rotas API:
   ```bash
   node server.js
   ```
2. Acesse http://localhost:3000 para abrir o app.
3. As rotas em `/api` reutilizam as chaves configuradas acima. Caso as chaves não estejam definidas, as rotas retornarão mensagens de erro claras.

## Rotas disponíveis
- `POST /api/chat` – proxy para OpenAI Chat Completions.
- `POST /api/image` – gera imagem via OpenAI (retorna data URI base64).
- `POST /api/signup` – cria usuário no Supabase Auth e provisiona plano free.
- `POST /api/login` – autentica usuário e retorna plano salvo.
- `POST /api/saveMessage` – armazena mensagens no Supabase.
- `POST /api/createPlan`, `GET /api/getPlan` – CRUD simplificado de planos.
- `GET /api/getHistory` – histórico de mensagens.
- `POST /api/updateConfig` – configurações do usuário.
- `POST /api/checkout` – retorna URL de checkout (ou instrução se `STRIPE_CHECKOUT_URL` não estiver definida).

## Observação
O front-end principal está em `index.html` e continua funcional mesmo sem todas as integrações ativas; os endpoints acima completam o fluxo quando as credenciais reais forem informadas.
