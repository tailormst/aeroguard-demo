#!/usr/bin/env bash

echo "Uploading demo dataset..."
gsutil -q cp dataset/* gs://aeroguard-inputs/

echo "Enqueuing job..."
resp=$(curl -s -X POST https://aeroguard-api-768547020206.asia-south1.run.app/enqueue-job \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"flights_gcs":"gs://aeroguard-inputs/flights.csv","crew_gcs":"gs://aeroguard-inputs/crew.csv","start_date":"2025-12-10"}')

echo "Response: $resp"

job_id=$(echo $resp | jq -r '.job_id')

if [ "$job_id" = "null" ] || [ -z "$job_id" ]; then
  echo "❌ Failed to create job"
  exit 1
fi

echo "Job ID: $job_id"

for i in 1 2 3 4 5; do
  status=$(curl -s https://aeroguard-api-768547020206.asia-south1.run.app/job-status/$job_id | jq -r '.status')
  echo "Status: $status"
  [ "$status" = "DONE" ] && break
  sleep 2
done
