<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🚀 AeroGuard AI — Airline Resilience Agent (MVP)

AeroGuard AI predicts crew shortages, simulates FDTL/regulatory shocks, generates compliant rosters, and drafts passenger communications — powered by Google AI Studio (Gemini 3 Pro) and a serverless backend on Cloud Run.

- Live AI Studio App: https://aeroguard-ai-resilience-agent-768547020206.us-west1.run.app
- Cloud Run API: https://aeroguard-api-768547020206.asia-south1.run.app
- Demo Video (2 min): PLACEHOLDER_VIDEO_URL
- GitHub Repository: https://github.com/tailormst/aeroguard-demo

---

## 📌 Overview

Airlines frequently face sudden operational disruptions caused by:

- ✈️ Crew shortages
- 🕒 FDTL / DGCA compliance limits
- 🌧️ Weather & regulatory shocks
- 📈 Sudden demand spikes

AeroGuard AI is an end-to-end reasoning agent that:

- Predicts shortages (7-day base-wise)
- Simulates crisis scenarios (regulatory / capacity limits)
- Generates compliant 7-day rosters (CSV + summary)
- Produces passenger communications (SMS / WhatsApp / Email, Hindi variants)

All orchestration happens inside Google AI Studio (for UI/workflow + Gemini) with a serverless backend on Cloud Run, Pub/Sub, and GCS.

---

## 🧱 Architecture (High-Level)

Component | Purpose
---|---
AI Studio Build App | UI + workflow orchestration
Gemini 3 Pro | Forecasting, simulation, reasoning, comms generation
FastAPI Cloud Run API | Async job scheduling & roster optimizer
Cloud Run Worker | Background processing (Pub/Sub consumer)
GCS Buckets | Input / output dataset storage
Pub/Sub | Job queue
Secret Manager | API keys and secrets
Cloud Logging | Observability & logs

---

## 🎮 Demo Flow (what you can try)

1. Upload datasets:
   - flights.csv
   - crew.csv
   - fdtl_rules.json
2. Shortage Predictor
   - Outputs a 7-day base-wise crew shortage forecast (low/medium/high + drivers)
3. Crisis Simulator
   - Example: "Set night_landings_limit_per_week = 2 from 2025-12-01"
   - Outputs predicted cancellations, hotspot bases, recommendations
4. Roster Optimizer
   - Auto-generate compliant 7-day rosters (CSV + constraints summary)
5. Passenger Communications
   - SMS (<160 chars)
   - WhatsApp template with {rebook_url}
   - Email content
   - Hindi versions included

---

## ▶️ Quick Reproduction (Judges / Evaluators)

Option A — Using the Published App
- Open the AI Studio app link
- Upload datasets
- Run Predictor → Simulator → Optimizer → Comms

Option B — Trigger Backend via Cloud Shell
1. Export demo API key:
```bash
export API_KEY="YOUR_DEMO_API_KEY"
```

2. Enqueue a job:
```bash
curl -X POST https://aeroguard-api-768547020206.asia-south1.run.app/enqueue-job \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
        "flights_gcs":"gs://aeroguard-inputs/flights.csv",
        "crew_gcs":"gs://aeroguard-inputs/crew.csv",
        "start_date":"2025-12-10"
      }'
```

3. Check job status:
```bash
curl -X GET "https://aeroguard-api-768547020206.asia-south1.run.app/job-status?job_id=YOUR_JOB_ID" \
  -H "x-api-key: $API_KEY"
```

---

## 🗂 Repository Structure
```
aeroguard-backend/
│
├── main.py               # Cloud Run API (enqueue, status endpoints)
├── worker.py             # Pub/Sub worker (background processing)
├── cloudbuild.yaml       # CI/CD build for Cloud Run
├── Dockerfile            # Backend container image
├── requirements.txt
│
├── dataset/
│   ├── flights.csv
│   ├── crew.csv
│   └── fdtl_rules.json
│
├── demo.sh               # Sample trigger script
└── README.md             # This file
```

## 🧠 AI Studio Prompt Templates (summary)

1. Shortage Predictor
- Role: airline ops analyst
- Input: flights.csv, crew.csv, fdtl_rules.json
- Output: 7-day JSON forecast with risk (low/medium/high), expected cancellations, key drivers, 1-line recommendation per base

2. Crisis Simulator
- Example prompt: "Set night_landings_limit_per_week = 2 starting 2025-12-01"
- Output: predicted cancellations, hotspot bases, regulatory violations, 2-sentence summary

3. Roster Optimizer
- Output: compliant 7-day roster (base64 CSV or public GCS URL), constraints summary, crew duty hours overview

4. Passenger Comms
- Output: SMS (<160 chars), WhatsApp template {rebook_url}, Email body, and Hindi versions

---

## 📁 Dataset Formats (examples)

flights.csv (example columns)
- flight_id, origin, dest, dep_time, arr_time, aircraft_type, required_crew

crew.csv (example columns)
- crew_id, name, base, rank, max_weekly_hours, multilingual (yes/no), preferences

fdtl_rules.json
- JSON object defining duty/rest limits, night landing caps per base, regulatory constraints

(Include realistic sample files under dataset/ for demos.)

---

## 🔐 Security & Compliance

- No service-account JSON files in the repo.
- Secrets (API keys, service accounts) stored in Secret Manager.
- API keys rotated after events.
- Public app is meant for demo-only usage; do not use demo credentials for production.

---

## 🛠 Deployment (Backend + Worker)

Deploy main API:
```bash
gcloud run deploy aeroguard-api \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated
```

Build & deploy worker (example using Cloud Build):
```bash
gcloud builds submit --config cloudbuild.yaml .
```

Notes:
- Ensure Secret Manager entries exist for required secrets.
- Configure Pub/Sub topics and GCS buckets referenced in configs.

---

## 🧪 Testing & Local Development

- Edit dataset/*.csv to craft edge-case scenarios (mass cancellations, base outages).
- Use demo.sh to enqueue test jobs against local or remote endpoints.
- Logs are written to Cloud Logging when deployed; use `gcloud` to tail logs in real time.

---

## 🙋‍ Maintainer

Mohammed Saifuddin Tailor  
GitHub: https://github.com/tailormst/aeroguard-demo

---

## License

This repository is provided for demo/MVP purposes. Please contact the maintainer for licensing details or reuse permissions.
