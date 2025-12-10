from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from google.cloud import storage, pubsub_v1
from datetime import timedelta
import pandas as pd
import tempfile, json, uuid, os
from typing import Optional

# ---------------- CONFIG ----------------
PROJECT_ID = "aeroguard-ai-480717"
TOPIC_ID = "aeroguard-jobs"
API_KEY = os.getenv("API_KEY")

app = FastAPI()

storage_client = storage.Client()
publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(PROJECT_ID, TOPIC_ID)

# simple in-memory DB
JOB_STATUS = {}


# ---------------- MODELS ----------------
class JobRequest(BaseModel):
    flights_gcs: str
    crew_gcs: str
    start_date: str


class SignedURLRequest(BaseModel):
    bucket: str
    object_name: str
    method: str = "PUT"
    expires: int = 3600


class StatusUpdate(BaseModel):
    job_id: str
    status: str
    output_url: Optional[str] = None


# ---------------- UTILS ----------------
def check_api_key(req: Request):
    header_key = req.headers.get("x-api-key")
    if API_KEY is None:
        raise HTTPException(status_code=500, detail="API_KEY not set in environment")

    if header_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")


def download_gs(gs_path: str) -> str:
    if not gs_path.startswith("gs://"):
        raise HTTPException(status_code=400, detail="Invalid GCS path")

    path = gs_path.replace("gs://", "")
    bucket_name, blob_path = path.split("/", 1)

    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_path)

    tmp = tempfile.NamedTemporaryFile(delete=False)
    blob.download_to_filename(tmp.name)
    return tmp.name


# ---------------- ROUTES ----------------

@app.get("/")
def root():
    return {"message": "AeroGuard API is running"}


@app.post("/enqueue-job")
async def enqueue_job(req: Request):
    check_api_key(req)
    body = await req.json()

    job_id = str(uuid.uuid4())

    JOB_STATUS[job_id] = {"status": "QUEUED"}

    message = {
        "job_id": job_id,
        "flights_gcs": body["flights_gcs"],
        "crew_gcs": body["crew_gcs"],
        "start_date": body["start_date"]
    }

    # Publish message
    future = publisher.publish(
        topic_path,
        json.dumps(message).encode("utf-8")
    )
    future.result()  # ensures publish completes

    return {"job_id": job_id, "status": "QUEUED"}


@app.get("/job-status/{job_id}")
def job_status(job_id: str):
    return JOB_STATUS.get(job_id, {"status": "UNKNOWN"})


@app.post("/generate-signed-url")
def generate_signed_url(req: SignedURLRequest):
    bucket = storage_client.bucket(req.bucket)
    blob = bucket.blob(req.object_name)

    url = blob.generate_signed_url(
        version="v4",
        expiration=timedelta(seconds=req.expires),
        method=req.method,
    )
    return {"url": url}


@app.post("/optimize-roster")
async def optimize_roster(req: JobRequest):
    flights_file = download_gs(req.flights_gcs)
    crew_file = download_gs(req.crew_gcs)

    df_f = pd.read_csv(flights_file)
    df_c = pd.read_csv(crew_file)

    # fake pilot assignment
    df_f["pilot_assigned"] = df_c["pilot_id"].iloc[0]

    out_csv = df_f.to_csv(index=False).encode("utf-8")

    bucket = storage_client.bucket("aeroguard-outputs")
    output_path = f"rosters/roster_{req.start_date}.csv"
    blob = bucket.blob(output_path)
    blob.upload_from_string(out_csv, content_type="text/csv")

    return {
        "gcs_url": f"gs://aeroguard-outputs/{output_path}",
        "public_url": blob.public_url
    }


@app.post("/job-status-update")
def job_status_update(req: StatusUpdate):
    JOB_STATUS[req.job_id] = {
        "status": req.status,
        "output_url": req.output_url
    }
    return {"ok": True}
