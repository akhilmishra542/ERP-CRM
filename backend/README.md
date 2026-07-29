# Mini ERP + CRM Operations Portal — Backend

Node.js + TypeScript + Express + PostgreSQL (Prisma ORM) backend for the ERP/CRM case study.

## Tech Stack
- Node.js + TypeScript
- Express.js
- PostgreSQL + Prisma ORM
- JWT authentication (role-based: ADMIN, SALES, WAREHOUSE, ACCOUNTS)
- Zod for request validation
- Helmet, CORS, Morgan for security/logging

## Project Structure
```
src/
  app.ts                  # Express app, middleware, route mounting
  server.ts                # Entry point
  config/env.ts             # Centralized environment variable loading
  middleware/
    auth.ts                 # JWT verification + role guard
    validate.ts              # Zod request validation
    errorHandler.ts           # Global error handler + Prisma error mapping
  lib/prisma.ts              # Prisma client singleton
  utils/
    ApiError.ts               # Standard error class
    asyncHandler.ts            # try/catch wrapper for async routes
    generateChallanNumber.ts    # Sequential challan number generator
  modules/
    auth/        # register, login, me
    customers/    # CRM: customer CRUD, search, follow-ups
    products/     # Product + stock movement log
    challans/     # Sales challan flow incl. stock deduction logic
prisma/
  schema.prisma   # Database schema
  seed.ts          # Seeds 4 test users + sample customer/products
postman_collection.json
```

## 1. Local Setup

### Prerequisites
- Node.js 18+
- A PostgreSQL database (local install, or a free hosted one — see below)

### Steps
```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and fill in values
cp .env.example .env
# Edit .env: set DATABASE_URL and JWT_SECRET

# 3. Run migrations (creates tables in your database)
npx prisma migrate dev --name init

# 4. Seed test data (creates 4 role-based users + sample customer/products)
npm run seed

# 5. Start the dev server
npm run dev
```
Server runs at `http://localhost:4000` by default. Health check: `GET /health`.

## 2. Environment Variables
| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default 4000) |
| `NODE_ENV` | `development` or `production` |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWTs — use a long random string |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1d` |
| `CORS_ORIGIN` | Comma-separated list of allowed frontend origins |

Never commit `.env` — only `.env.example` is checked into git.

## 3. Free Hosted Database Options
Any of these work well with Prisma and give a free Postgres instance:
- **Neon** (neon.tech) — recommended, generous free tier, instant provisioning
- **Supabase** (supabase.com)
- **Render Postgres**

Copy the connection string they provide into `DATABASE_URL` in `.env`, then run `npx prisma migrate deploy`.

## 4. Deployment (Render example)
1. Push this repo to GitHub.
2. On Render: New → Web Service → connect the repo.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `NODE_ENV=production`) in Render's dashboard.
6. After first deploy, run migrations against the production DB: `npx prisma migrate deploy` (can be run locally pointed at the prod `DATABASE_URL`, or as a Render one-off job).

Railway / Fly.io follow the same pattern: install → build → start, with env vars set in their dashboard.

## 5. Test Login Credentials (after running `npm run seed`)
All passwords: `Password123!`

| Role | Email |
|---|---|
| Admin | admin@erp.com |
| Sales | sales@erp.com |
| Warehouse | warehouse@erp.com |
| Accounts | accounts@erp.com |

## 6. API Overview
Base URL: `http://localhost:4000` (local) or your deployed URL.

All routes except `/auth/login` and `/auth/register` require:
`Authorization: Bearer <token>`

| Method | Route | Roles allowed | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create a user |
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/auth/me` | Any authenticated | Current user profile |
| GET | `/customers` | Any authenticated | List/search/paginate customers |
| GET | `/customers/:id` | Any authenticated | Customer detail incl. follow-ups & recent challans |
| POST | `/customers` | Admin, Sales | Create customer |
| PUT | `/customers/:id` | Admin, Sales | Update customer |
| POST | `/customers/:id/follow-up` | Admin, Sales | Add a follow-up note |
| GET | `/products` | Any authenticated | List/search/paginate products |
| GET | `/products/:id` | Any authenticated | Product detail |
| POST | `/products` | Admin, Warehouse | Create product |
| PUT | `/products/:id` | Admin, Warehouse | Update product |
| POST | `/products/:id/stock-movements` | Admin, Warehouse | Record manual stock IN/OUT |
| GET | `/products/:id/stock-movements` | Any authenticated | Stock movement history |
| GET | `/challans` | Any authenticated | List/search/paginate challans |
| GET | `/challans/:id` | Any authenticated | Challan detail |
| POST | `/challans` | Admin, Sales | Create challan (Draft or Confirmed) |
| POST | `/challans/:id/confirm` | Admin, Sales, Warehouse | Confirm a Draft challan (reduces stock) |
| POST | `/challans/:id/cancel` | Admin, Sales, Warehouse | Cancel a challan (restores stock if it was confirmed) |

Import `postman_collection.json` into Postman for ready-made requests. Set the `token` collection variable after logging in.

## 7. Key Business Logic Notes
- **Stock never goes negative.** Any confirm/create-as-confirmed operation validates stock availability for every line item inside a single Prisma transaction — if any item is short, the entire operation is rolled back and a 400 error lists the shortages.
- **Product snapshotting.** `ChallanItem` stores `productName`, `productSku`, and `unitPrice` copied at the time of the challan, not a live reference — so editing a product later never changes historical challans.
- **Cancelling a confirmed challan restocks automatically**, with a `StockMovement` (`IN`) logged for audit.
- **Challan numbers** are auto-generated per calendar year (`CH-2026-0001`, `CH-2026-0002`, ...).

## 8. Known Limitations / Assumptions
- `/auth/register` is left open (not admin-gated) to simplify grading/testing; in production this would be restricted to Admins creating staff accounts.
- No refresh-token rotation — a single JWT with a configurable expiry is used, per the assignment's "simple JWT-based authentication is acceptable" note.
- No file/image upload (S3) implemented — listed as a bonus item, out of scope for the 48-hour core deliverable.
- Invoice PDF export not implemented — bonus item.
- Docker/GitHub Actions not included — bonus item.
