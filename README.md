# Samadhan Setu Jharkhand (समाधान सेतु झारखंड)

AI-powered platform connecting citizen grievances with Higher Education Institutions for R&D and Industry/CSR partners for funding — built for **Smart India Hackathon 2026**, Problem Statement **SIH26043** (Govt. of Jharkhand, Dept. of Higher & Technical Education), by team **Dhurandhars**.

## Live Links

- **App:** https://samadhan-setu-lilac.vercel.app
- **Backend API Docs:** https://samadhan-setu-u8da.onrender.com/docs
- **Source:** https://github.com/arbaznafees/Samadhan_Setu

> Backend is on Render's free tier — first request after ~15 min idle may take 30–50s to wake up.

## Tech Stack

- **Frontend:** Next.js 14 + Tailwind, deployed on Vercel
- **Backend:** FastAPI + Celery, deployed on Render
- **Database:** PostgreSQL (Render) with PostGIS + pgvector
- **AI:** Google Gemini — domain classification, embeddings, dedup
- **Auth:** JWT with role-based access (citizen, hei_reviewer, industry_partner, govt_admin)

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

## Team Dhurandhars

Arbaz Nafees (Lead, Backend/ML), Ankush Sachan, Divya Bhagat, Bhavya Bhagat, Anjali Devi, Mohd Fuzail Haider — IIT Madras BS Degree Programme.

## License

MIT
