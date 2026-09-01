# Samadhan Setu Jharkhand (समाधान सेतु झारखंड)

AI-powered platform connecting citizen grievances with Higher Education Institutions for R&D and Industry/CSR partners for funding — built for **Smart India Hackathon 2026**, Problem Statement **SIH26043** (Govt. of Jharkhand, Dept. of Higher & Technical Education).

## Live Links

- **App:** https://samadhan-setu-lilac.vercel.app
- **Backend API Docs:** https://samadhan-setu-u8da.onrender.com/docs
- **Source:** https://github.com/arbaznafees/Samadhan_Setu

## Architecture

```
                                [ Citizen PWA ]
                       (Geotagged Issues & Evidence)
                                     │
                                     ▼
                   [ FastAPI Backend + Celery Worker ]
                       │                       │
       ┌───────────────┴───────────────┐       │
       ▼                               ▼       │
 [ Gemini AI ]                  [ PostgreSQL ] │
 - Domain Triage                - PostGIS Geo   │
 - 768-dim Embeddings           - pgvector Dedup│
 - In-app Chatbot               - Core Data     │
       │                               │       │
       └───────────────┬───────────────┘       │
                       ▼                       ▼
          [ Rules-Based HEI Matching ] ──► [ HEI Portal ]
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

- **Frontend:** Next.js 14 + Tailwind — 4 role-isolated shells (Citizen, HEI, Industry, Govt), each with its own layout and navigation. Deployed on Vercel.
- **Backend:** FastAPI + Celery (async AI triage jobs), deployed on Render.
- **Database:** PostgreSQL (Render) with PostGIS (geo queries) + pgvector (duplicate detection).
- **AI:** Google Gemini — domain classification, 768-dim embeddings for dedup, and an in-app assistant for navigation/page summaries.
- **Auth:** JWT with role-based access control across 4 roles (citizen, hei_reviewer, industry_partner, govt_admin) — each role can only reach its own routes.
- **Uptime:** A cron job pings the backend every 10 minutes to avoid Render's free-tier cold starts.

## How It Works

1. Citizen submits a geotagged grievance with photo/video evidence.
2. Gemini classifies the domain and generates an embedding; pgvector flags duplicates (>80% similarity).
3. A rules-based engine matches the report to the best HEI by specialization overlap, Haversine distance, and workload.
4. The HEI forms a team and submits a proposal.
5. An industry/CSR partner pledges funding.
6. The government dashboard shows live aggregates by domain, district, and resolution rate.

## Demo Logins

| Role | Email | Password |
|---|---|---|
| Citizen | citizen@samadhansetu.jh.gov.in | password123 |
| HEI Reviewer (BIT Mesra) | bit.mesra@samadhansetu.jh.gov.in | password123 |
| Industry (Tata Steel CSR) | csr@tatasteel.com | password123 |
| Govt Admin | admin@jharkhand.gov.in | password123 |

## Run Locally

```bash
# Backend
cd backend
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

Needs a `.env` in `backend/` with `DATABASE_URL`, `REDIS_URL`, `GEMINI_API_KEY`, and `JWT_SECRET` — see `.env.example`.

## License

MIT
