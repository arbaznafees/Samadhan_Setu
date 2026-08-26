# Samadhan Setu Jharkhand (समाधान सेतु झारखंड)
### AI-Powered Civic Grievance to Institutional Research (HEI) & CSR Funding Platform

[![CI](https://github.com/your-username/Samadhan_Setu/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/Samadhan_Setu/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black.svg?logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20PostGIS%20%2B%20pgvector-336791.svg?logo=postgresql)](https://www.postgresql.org)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini%20Flash-4285F4.svg?logo=google)](https://deepmind.google/technologies/gemini/)

**Samadhan Setu Jharkhand** is a full-stack governance platform that connects citizen grievances with Higher Education Institutions (BIT Mesra, IIT ISM Dhanbad, NIT Jamshedpur, Birsa Agricultural University, AIIMS Deoghar, Kolhan University) for faculty-led R&D and routes formulated solutions to corporate CSR partners (e.g. Tata Steel Foundation) for funding and field deployment.

---

## 🏛️ Platform Architecture

```
                                  [ Citizen PWA ]
                         (Geotagged Issues & Evidence)
                                       │
                                       ▼
                     [ FastAPI Backend / Celery Worker ]
                         │                       │
         ┌───────────────┴───────────────┐       │
         ▼                               ▼       │
   [ Gemini AI ]                  [ PostgreSQL ] │
  - Domain Triage                - PostGIS Geo   │
  - 768-dim Embeddings           - pgvector Dedup│
  - Multilingual Translation     - Core Data     │
         │                               │       │
         └───────────────┬───────────────┘       │
                         ▼                       ▼
            [ Rules HEI Routing Engine ] ──► [ HEI Portal ]
                                         (Team & Proposals)
                                                 │
                                                 ▼
                                        [ Industry Portal ]
                                        (CSR Grants & Offers)
                                                 │
                                                 ▼
                                        [ Govt Dashboard ]
                                      (Statewide Analytics)
```

---

## 📦 Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + Tailwind CSS (Google Stitch corporate governance design system with Poppins & Inter typography). Deploys to **Vercel**.
- **Backend**: FastAPI (Python 3.12) with Celery async task queue + Redis. Deploys to **Render** as Web Service + Worker.
- **Database**: Render Managed PostgreSQL with **PostGIS** and **pgvector** extensions.
- **AI Classification & Deduplication**: Google Gemini 2.5 Flash API (domain classification, executive summaries, 768-dimensional embeddings) with deterministic fallback simulation mode & rate-limit caching/backoff.
- **Auth**: JWT Authentication with Role-Based Access Control (RBAC) across 4 roles: `citizen`, `hei_reviewer`, `industry_partner`, `govt_admin`.
- **Media Storage**: S3-compatible bucket (Cloudflare R2 / AWS S3) with local media fallback.

---

## ⚠️ Important Render Database & Background Worker Setup

> [!IMPORTANT]
> 1. **PostGIS & pgvector Activation**: Render does not automatically enable PostgreSQL extensions when a database is provisioned. You **MUST** run the following SQL commands manually via Render's `psql` web shell or CLI:
> ```sql
> CREATE EXTENSION IF NOT EXISTS postgis;
> CREATE EXTENSION IF NOT EXISTS vector;
> ```
> Verify that the extensions are active:
> ```sql
> SELECT extname FROM pg_extension WHERE extname IN ('postgis', 'vector');
> ```
>
> 2. **Render Plan for Celery Background Worker**: Render's **Free Tier** supports Web Services and Managed PostgreSQL/Redis, but does **not** support Background Workers. The Celery worker (`samadhan-setu-worker`) requires the **Render Starter Plan ($7/month)**. 
> *Note: If deploying on a 100% free tier without the separate background worker, the FastAPI backend automatically falls back to asynchronous in-process background tasks.*

---

## ❄️ Render Free-Tier Cold Starts & Service Pre-Warming

> [!NOTE]
> On Render's free tier, inactive web services spin down after 15 minutes of idle time. The first request after idle may experience a **30-50 second cold start**.

### How to Pre-Warm the Backend Before a Live Demo:
1. Ping the dedicated health check & pre-warm endpoint:
   ```bash
   curl -I https://your-backend-service.onrender.com/api/health
   ```
2. Once you receive `HTTP 200 OK` with JSON `{"status": "healthy", "service": "Samadhan Setu Jharkhand"}`, the database pool, pgvector extension, and FastAPI app are fully awake and ready for instantaneous responses!

---

## 🔑 Environment Variables Configuration

Copy `.env.example` in `backend/` to `.env`:

```env
# Port & Environment
ENV=development
PORT=8000

# PostgreSQL Database (Render Managed PostgreSQL external connection URL)
DATABASE_URL=postgresql://samadhan_user:your_password@dpg-xxxxxx-a.oregon-postgres.render.com/samadhan_db?sslmode=require

# Redis URL for Celery Background Worker
REDIS_URL=redis://default:your_redis_password@red-xxxxxx:6379

# Google Gemini API Key (Gemini Flash)
# If omitted, backend logs a warning and operates in visible SIMULATION MODE
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# JWT Secret
JWT_SECRET=samadhan_setu_jharkhand_super_secret_jwt_key_2026_change_in_prod
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# S3 / Cloudflare R2 Media Storage (Optional)
S3_ENDPOINT_URL=https://your-account-id.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your_s3_access_key
S3_SECRET_ACCESS_KEY=your_s3_secret_key
S3_BUCKET_NAME=samadhan-setu-media
S3_REGION_NAME=auto
```

---

## 🚀 Running the Full Stack Locally

### 1. Start the FastAPI Backend
```bash
cd backend
pip install -r requirements.txt

# Run initial seed script with realistic Jharkhand HEIs and demo records:
python seed.py

# Start FastAPI server directly:
uvicorn main:app --reload --port 8000
```

### 2. Start Celery Worker (Optional for async background jobs)
```bash
cd backend
celery -A celery_app.celery_worker worker --loglevel=info
```

### 3. Start Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 👥 1-Click Demo Evaluation Profiles

The navigation header includes a 1-click **Persona Switcher** for instant testing:

| Stakeholder Role | Email | Password | Pre-configured Access |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@samadhansetu.jh.gov.in` | `password123` | Geotagged issue reporting, public tracking |
| **HEI Reviewer (BIT Mesra)** | `bit.mesra@samadhansetu.jh.gov.in` | `password123` | Assigned issues, AI match score, team formation & proposals |
| **Industry Partner (Tata Steel CSR)** | `csr@tatasteel.com` | `password123` | Solution catalog, CSR grant pledging, mentorship offers |
| **Govt Admin** | `admin@jharkhand.gov.in` | `password123` | Real aggregated analytics, duplicate inspector, HEI override |

---

## 🧪 Core End-to-End Workflow Verification

1. **Submit Citizen Grievance**: Navigate to `/citizen/report`, upload evidence, capture GPS coordinates, and submit.
2. **AI Triage & pgvector Dedup**: Celery / Gemini classifies domain and checks cosine similarity. If similarity > 80%, a duplicate warning banner is attached.
3. **Rules HEI Routing**: Matches against registered specializations of BIT Mesra, IIT ISM, NIT, BAU, and assigns top institution.
4. **HEI Proposal Formulated**: Log in as HEI faculty, open `/hei`, assemble an interdisciplinary team (PI, Co-PI, students), and submit proposal.
5. **CSR Funding Pledged**: Log in as Industry partner, open `/industry`, view the proposal, and pledge a CSR grant.
6. **Govt Analytics Aggregation**: Open `/govt` to see live PostgreSQL aggregate calculations by domain, district, and resolution rates.
