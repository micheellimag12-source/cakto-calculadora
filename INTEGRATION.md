# Calculadora Cakto — Integração CRM / Backend

Documentação para o time de automação. Cobre os 3 endpoints REST que o front consome, payloads, segurança e integração com CRM/marketing.

---

## 1. Visão geral

- Form multi-step (3 telas) embedado via iframe no Framer.
- Cada **avanço de step** dispara um POST autônomo pro backend → CRM.
- A **simulação final** dispara um POST + um `postMessage` pro Framer (analytics).
- Tudo correlacionado por um `session_id` (UUID v4) gerado no client.
- Sessão **não persiste em cookie**. Vive só na sessão da aba.

```
[Lead]
  └─ Step 1: nome/email/whatsapp  → POST /identificacao   → CRM (cria contato)
  └─ Step 2: faturamento/plataforma → POST /perfil          → CRM (enriquece)
  └─ Step 3: clica "Simular"        → POST /simulacao       → CRM (qualifica)
                                    + postMessage cakto:simulado → GA4 via Framer
```

---

## 2. Endpoints a criar

Todos `POST`, body `application/json`, retornar `200 OK` (corpo ignorado pelo front).
Falha silenciosa: se o backend cair ou demorar, o lead não percebe e a UX continua.

### 2.1 `POST /leads/calculadora/identificacao` — Step 1

Trigger: lead clica **Próximo** na tela 1 com nome, email e whatsapp válidos.

```json
{
  "session_id": "5d1c4b8e-9f2a-4c3b-8d7e-1a2b3c4d5e6f",
  "timestamp": "2026-05-14T13:45:12.000Z",
  "step": 1,
  "nome": "Michel Lima",
  "email": "michel@cakto.com.br",
  "whatsapp": "(11) 99999-8888",
  "meta": {
    "referrer": "https://google.com/",
    "landing_url": "https://cakto.me/calculadora?utm_source=meta&utm_campaign=parcelado",
    "utm": {
      "utm_source": "meta",
      "utm_medium": "cpc",
      "utm_campaign": "parcelado",
      "utm_term": null,
      "utm_content": null,
      "gclid": null,
      "fbclid": "abc123..."
    }
  }
}
```

Campos do `meta.utm` só vêm se estiverem na URL. Strings limitadas a 500 chars no client (revalidar no backend).

### 2.2 `POST /leads/calculadora/perfil` — Step 2

Trigger: lead clica **Próximo** na tela 2 com faturamento + plataforma escolhidos.

```json
{
  "session_id": "5d1c4b8e-9f2a-4c3b-8d7e-1a2b3c4d5e6f",
  "timestamp": "2026-05-14T13:45:58.000Z",
  "step": 2,
  "faturamento": "Entre R$10 Mil e R$50 Mil por mês",
  "plataforma": "Hotmart"
}
```

**Valores fixos** que `faturamento` pode receber:
- `Ainda não vendo nada, mas tenho uma ideia de produto`
- `Menos de R$10 Mil por mês`
- `Entre R$10 Mil e R$50 Mil por mês`
- `Entre R$50 Mil e R$100 Mil por mês`
- `Entre R$100 Mil e R$1 Milhão por mês`
- `Acima de R$1 Milhão por mês`

**Valores fixos** que `plataforma` pode receber:
`Hotmart`, `Kiwify`, `PerfectPay`, `Eduzz`, `Monetizze`, `Ticto`, `Kirvano`, `Guru`, `Asaas`, `Hubla`, `Appmax`, `LastLink`, `Outros`, `Nenhuma`.

Validar contra esta lista no backend e rejeitar (silenciosamente) qualquer outro valor.

### 2.3 `POST /leads/calculadora/simulacao` — Step 3

Trigger: lead clica **Simular meu ganho** na tela 3.

```json
{
  "session_id": "5d1c4b8e-9f2a-4c3b-8d7e-1a2b3c4d5e6f",
  "timestamp": "2026-05-14T13:46:30.000Z",
  "step": 3,
  "valor": 5000.00,
  "parcelas": 10,
  "taxa_adicional": 10.0,
  "total": 5500.00,
  "extra": 500.00
}
```

Numbers em ponto flutuante. `valor` e `total` em reais (não em centavos).

---

## 3. CORS

Liberar **apenas** as origens que vão hospedar o front. Hoje:

```
Access-Control-Allow-Origin: <uma das de baixo>
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400
```

Whitelist sugerida:
- `https://micheellimag12-source.github.io` (host atual, GitHub Pages)
- `https://cakto.me` e `https://www.cakto.me` (produção)
- `https://<seu-projeto>.framer.website` (preview do Framer)

**NÃO** habilitar `Access-Control-Allow-Credentials: true`. O front usa `credentials: 'omit'`.

---

## 4. Segurança e validação no backend

Front faz validação leve. Backend deve **sempre** revalidar.

| Camada | Front | Backend (obrigatório) |
|---|---|---|
| Rate limit | — | **10 req/min por IP** por endpoint |
| Email regex | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | Revalidar + checagem MX opcional |
| WhatsApp | máscara `(99) 99999-9999` | Regex BR + 10-11 dígitos |
| Faturamento/plataforma | dropdown fixo | Allowlist contra lista oficial |
| Sanitização | strip control chars + 500 chars | Revalidar |
| Time-gate anti-bot | mín 1500ms entre steps, 800ms desde abertura | — |
| Honeypot | campo `website` invisível, descartado se preenchido | Se algum dia receber `website` no payload, dropar |
| Origin check | postMessage só pra origens da config | Validar `Origin` header do request |

Logging:
- **NUNCA** logar email/whatsapp em plaintext em INFO/DEBUG. Mascarar: `m***@cakto.com.br`, `(11) *****-8888`.
- Logar `session_id`, `timestamp`, `step` sempre.

LGPD:
- O site precisa de política de privacidade mencionando coleta de PII para qualificação comercial.
- O usuário precisa poder pedir delete (endpoint `DELETE /leads/{session_id}` se possível).

---

## 5. Integração com CRM

Sugestões de fluxo. Pode encaminhar cada POST pra um webhook do n8n/Zapier/Make e fazer a lógica lá.

### Mailchimp / Brevo / RD Station
- **Step 1** → criar contato com tags `lead-calculadora`, `utm-{source}`. Status: `lead-quente`.
- **Step 2** → atualizar contato com campos custom `faturamento_mensal`, `plataforma_atual`.
- **Step 3** → flag `simulou_calculadora=true`, custom `ganho_simulado=R$ {extra}`. Trigger automação de email pós-simulação.

### HubSpot
- **Step 1** → Create or Update Contact (lookup por email).
- **Step 2** → Update Contact properties.
- **Step 3** → Create Deal "Simulação calculadora — R$ {extra} de ganho extra" no funil de vendas.

### n8n (recomendado)
1. Recebe webhook do backend.
2. Switch por `step`.
3. Step 1 → notifica Slack `#leads-calculadora`. Cria/atualiza contato no CRM.
4. Step 2 → enriquece dados (CNPJ via Receita, score Clearbit, etc.).
5. Step 3 → atribui vendedor por região/faturamento, abre task no comercial.

---

## 6. Eventos `postMessage` (pro Framer Code Override)

A calculadora dispara duas mensagens pro `window.parent` (a página Framer):

### `cakto:step`
Cada vez que o lead avança de step.
```js
{ type: 'cakto:step', payload: { step: 1, session_id: '<uuid>' } }
{ type: 'cakto:step', payload: { step: 2, session_id: '<uuid>' } }
```

### `cakto:simulado`
Ao clicar "Simular meu ganho". **Sem PII** (nome/email/whatsapp ficam no backend).
```js
{
  type: 'cakto:simulado',
  payload: {
    session_id: '<uuid>',
    valor: 5000,
    parcelas: 10,
    taxaAdicional: 10,
    total: 5500,
    extra: 500
  }
}
```

O Override `withCalculadoraTracking.tsx` que vocês já têm captura `cakto:simulado` e manda pro GA4. Pra trackear também os steps intermediários, adicionar no mesmo handler:

```ts
if (event.data?.type === "cakto:step") {
  const { step, session_id } = event.data.payload
  window.gtag?.("event", "calculadora_step", { step, session_id })
}
```

---

## 7. Configuração do front

Editar [`index.html`](index.html) no GitHub. Bloco `CONFIG` no topo do `<script>`:

```js
const CONFIG = {
  API_BASE_URL: 'https://api.cakto.com.br',  // ← URL do backend Cakto
  ENDPOINTS: {
    step1Identificacao: '/leads/calculadora/identificacao',
    step2Perfil:        '/leads/calculadora/perfil',
    step3Simulacao:     '/leads/calculadora/simulacao',
  },
  PARENT_ORIGINS: [                          // ← origens que recebem postMessage
    'https://cakto.me',
    'https://www.cakto.me',
    'https://<seu-projeto>.framer.website',
  ],
  MIN_STEP_MS: 1500,
};
```

Após editar:
1. Commit + push pra `main`.
2. GitHub Pages republica em ~1 min.
3. O iframe do Framer pega a versão nova sem precisar mexer no embed.

---

## 8. Checklist de go-live

- [ ] Endpoints criados em produção e respondendo 200 OK.
- [ ] CORS configurado com a whitelist correta.
- [ ] Rate limit ativo (10 req/min por IP).
- [ ] Backend revalida email, whatsapp, faturamento, plataforma.
- [ ] Webhook → n8n/Zapier configurado.
- [ ] CRM recebe e cria contato corretamente nos 3 steps.
- [ ] `CONFIG.API_BASE_URL` preenchido no `index.html` e publicado.
- [ ] `CONFIG.PARENT_ORIGINS` inclui o domínio do Framer publicado.
- [ ] Override `withCalculadoraTracking` aplicado no Embed do Framer.
- [ ] GA4 recebendo evento `calculadora_simulada`.
- [ ] LGPD: política de privacidade no site menciona coleta de PII via calculadora.
- [ ] Logs do backend mascaram email/whatsapp.
- [ ] Smoke test end-to-end: preencher os 3 steps, ver lead no CRM.
