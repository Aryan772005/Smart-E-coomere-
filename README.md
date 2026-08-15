# Reloqa — Second-Hand Marketplace

A production-grade peer-to-peer marketplace for pre-owned goods, inspired by the quality of Cashify, Flipkart and OLX with a distinct, premium identity.

## Architecture

```
├── frontend/   Next.js 14 (App Router) + React + TypeScript + Tailwind CSS + Framer Motion
├── backend/    Django 4.2 + Django REST Framework + PostgreSQL
└── docker-compose.yml   Local PostgreSQL for development
```

- **Frontend** — deployed to Vercel. Client components, server components, REST client, design system.
- **Backend** — deployed to Railway/Render. Modular Django apps, JWT auth (access + refresh), role-based permissions.
- **Database** — PostgreSQL (SQLite fallback for local CI).
- **Storage** — Cloudinary for product/user images.
- **Payments** — Razorpay (order checkout + seller payouts).
- **Auth** — JWT (djangorestframework-simplejwt), Google OAuth, email OTP.

## Product Capabilities

- Authentication: login, register, forgot password, email OTP, Google login
- Marketplace: sell, buy, search, filters, categories, product details, wishlist, cart, checkout
- Seller: dashboard, analytics, orders, listings, wallet
- Buyer: orders, wishlist, profile, addresses, reviews
- Admin: dashboard, products, users, reports, coupons, analytics
- Cross-cutting: notifications, live chat, reviews/ratings, recommendations, order tracking

## Quick Start

### 1. Database

```bash
docker compose up -d postgres
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

API docs available at `http://localhost:8000/api/docs/`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment Reference

| Variable | Where | Purpose |
| --- | --- | --- |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | `docker-compose.yml` | Local Postgres credentials |
| `DATABASE_URL` | `backend/.env` | Production DB DSN (`dj-database-url`) |
| `SECRET_KEY` | `backend/.env` | Django secret key |
| `DJANGO_DEBUG` | `backend/.env` | `1` for dev, `0` for prod |
| `CORS_ALLOWED_ORIGINS` | `backend/.env` | Comma-separated frontend origins |
| `NEXT_PUBLIC_API_URL` | `frontend/.env.local` | Backend base URL from the browser |
| `NEXT_PUBLIC_APP_URL` | `frontend/.env.local` | Frontend canonical URL |

Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) and Razorpay (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) keys are consumed in later phases.

## Development Workflow

The platform is built in phases; each phase ends with an approval checkpoint.

1. **Phase 1 — Architecture** (current): monorepo scaffold, design system, core backend.
2. Phase 2 — Frontend layout (header, footer, navigation, home).
3. Phase 3 — Authentication (login, register, OTP, password reset, Google).
4. Phase 4 — Marketplace (catalog, product details, wishlist, cart, checkout).
5. Phase 5 — Seller dashboard.
6. Phase 6 — Buyer dashboard.
7. Phase 7 — Admin panel.
8. Phase 8 — Backend APIs (full API surface).
9. Phase 9 — Testing.
10. Phase 10 — Deployment.

## Conventions

- Backend: every app exposes `models`, `serializers`, `permissions`, `filters`, `pagination`, `views`, `urls`.
- Frontend: `src/components` (design system in `ui/`), `src/hooks`, `src/services`, `src/types`, `src/utils`, `src/context`, `src/config`.
- All REST endpoints are prefixed `/api/v1/`.
- Errors are returned in a consistent `{ code, message, fieldErrors }` envelope.
