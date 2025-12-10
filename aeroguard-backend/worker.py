from fastapi import FastAPI, Request
import base64, json, requests, os

API_KEY = os.getenv("API_KEY")

OPTIMIZER_URL = "https://aeroguard-api-768547020206.asia-south1.run.app/optimize-roster"
STATUS_URL = "https://aeroguard-api-768547020206.asia-south1.run.app/job-status-update"

app = FastAPI()


def safe_post(url, payload):
    """Post with API key + error handling"""
    try:
        return requests.post(
            url,
            json=payload,
            headers={"x-api-key": API_KEY},
            timeout=60
        ).json()
    except Exception as e:
        print("POST ERROR:", e)
        return None


@app.post("/pubsub-push")
async def pubsub_push(request: Request):
    """Receive Pub/Sub push → process job → update status."""
    body = await request.json()

    # Pub/Sub validation
    if "message" not in body:
        return {"status": "ignored"}

    # Decode base64
    raw_data = body["message"].get("data")
    if not raw_data:
        return {"status": "no-data"}

    try:
        decoded = base64.b64decode(raw_data).decode()
        job = json.loads(decoded)
    except Exception:
        return {"status": "bad-data"}

    job_id = job["job_id"]

    # 1) Mark as PROCESSING
    safe_post(STATUS_URL, {
        "job_id": job_id,
        "status": "PROCESSING"
    })

    # 2) Call optimizer
    result = safe_post(OPTIMIZER_URL, {
        "flights_gcs": job["flights_gcs"],
        "crew_gcs": job["crew_gcs"],
        "start_date": job["start_date"]
    })

    # 3) Mark DONE or FAILED
    if result and "public_url" in result:
        safe_post(STATUS_URL, {
            "job_id": job_id,
            "status": "DONE",
            "output_url": result["public_url"]
        })
    else:
        safe_post(STATUS_URL, {
            "job_id": job_id,
            "status": "FAILED",
            "output_url": None
        })

    # Pub/Sub requires always returning 200 OK
    return {"status": "processed"}
