# P6Hub — Módulo de Assinaturas

Um serviço backend em **NestJS + Prisma** para gerenciar empresas, usuários, colaboradores e assinaturas via Stripe. O foco é simplicidade, segurança e um fluxo de cobrança previsível.

---

## Tecnologias

- **NestJS** (estrutura modular)
- **Prisma ORM**
- **PostgreSQL**
- **JWT** para autenticação
- **Stripe** para cobrança

---

## Perfis de Usuário

### **Admin**

Criado manualmente. Não faz signup.

- Criar empresas
- Listar empresas
- **Rotas**:
  - `POST /admin/login`
  - `POST /companies`
  - `GET /companies`

### **Owner (Usuário da empresa)**

Faz signup e controla sua empresa.

- Criar conta
- Gerenciar colaboradores
- Iniciar checkout da assinatura
- Acompanhar status da assinatura
- **Rotas**:
  - `POST /auth/signup`
  - `POST /auth/login`
  - `POST /company-users`
  - `GET /company-users`
  - `POST /subscriptions/checkout`
  - `GET /subscriptions/my`

### **Colaborador**

Criado pelo owner.

- Acesso somente-leitura à empresa
- **Rotas**:
  - `GET /company-users/me`
  - `GET /companies/my`

---

## Principais Módulos

- **Auth** – login, signup, JWT
- **Users** – base de usuários
- **Companies** – dados da empresa
- **CompanyUsers** – relação empresa ↔ usuários
- **Subscriptions** – assinatura e status
- **Stripe** – checkout e webhook

---

## Schema (Prisma)

Principais modelos:

**User**

- id
- email
- password
- role (ADMIN, USER, COLLABORATOR)

**Company**

- id
- name
- cnpj

**CompanyUser**

- id
- companyId
- userId
- roleInCompany (OWNER, COLLABORATOR)

**Subscription**

- id
- companyId
- stripeCustomerId
- stripeSubscriptionId
- status

---

## Stripe — Fluxo Simplificado

1. **Checkout**: endpoint cria sessão e retorna URL
2. **Webhook**: Stripe envia eventos e o backend atualiza assinatura
3. **Consulta**: owner acessa status atualizado

---

## Como Rodar o Projeto

```bash
npm install
npx prisma migrate dev
npm run start:dev
```

Criar `.env` baseado em `.env.example`:

```
DATABASE_URL=
JWT_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

Pronto. Um resumo direto, claro e prático para onboarding rápido.
