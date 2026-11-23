import sys
import os
import json
import time

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.database import get_database, check_db_health
from app.services.gemini_service import gemini_service

client = TestClient(app)

def run_verification():
    print("=" * 70)
    print("DISCOSYNTH AI - COMPLETE LIVE END-TO-END VERIFICATION")
    print("=" * 70)

    # 1. Health check & DB check
    print("\n[Step 1] Checking System Health & Database Connection...")
    assert check_db_health() is True, "MongoDB health check failed!"
    health_resp = client.get("/api/health")
    assert health_resp.status_code == 200, f"Health API returned {health_resp.status_code}"
    health_data = health_resp.json()
    print("Health response:", json.dumps(health_data, indent=2))
    assert health_data["database"]["status"] == "connected"
    assert health_data["generative_ai"]["configured"] is True
    print("PASS: System Health and MongoDB connection verified.")

    # 2. Natural Language Scenario Interpretation via Gemini
    print("\n[Step 2] Testing NL Scenario Interpretation via Gemini...")
    prompt_text = (
        "Generate a corporate accounting fraud litigation dataset involving unrecorded liabilities, "
        "whistleblower emails, audit committee memos, and outside legal counsel communications between 2022 and 2024."
    )
    t0 = time.time()
    interp_resp = client.post("/api/scenario/interpret", json={"prompt": prompt_text})
    assert interp_resp.status_code == 200, f"Interpretation failed: {interp_resp.status_code} - {interp_resp.text}"
    interp_data = interp_resp.json()
    print(f"Interpretation succeeded in {round(time.time() - t0, 2)}s!")
    print(f"Suggested Case Title: {interp_data.get('suggested_name')}")
    print(f"Inferred Scenario: {interp_data['inferred_config']['scenario_type']}")
    print(f"Key Entities: {interp_data.get('key_entities')}")
    print(f"Inferred Issues: {interp_data.get('inferred_issues')}")
    assert interp_data["inferred_config"]["scenario_type"] in [
        "Corporate Fraud", "Financial Misconduct", "Custom Scenario"
    ]
    print("PASS: Natural language scenario interpretation verified.")

    # 3. Live Synthetic Dataset Generation (10 Records)
    print("\n[Step 3] Generating 10 Synthetic Litigation Records via Gemini...")
    gen_config = interp_data["inferred_config"]
    gen_config["size"] = 10  # Set to 10 records for targeted benchmark
    gen_config["custodian_count"] = 4

    t0 = time.time()
    gen_resp = client.post("/api/generation/generate", json=gen_config)
    assert gen_resp.status_code == 200, f"Generation failed: {gen_resp.status_code} - {gen_resp.text}"
    dataset_data = gen_resp.json()
    duration = round(time.time() - t0, 2)
    dataset_id = dataset_data["dataset_id"]
    records = dataset_data["records"]
    doc_count = len(records)
    print(f"Generation succeeded in {duration}s!")
    print(f"Generated Dataset ID: {dataset_id}")
    print(f"Case Name: {dataset_data['name']}")
    print(f"Model Used: {dataset_data['model_info']['model_name']}")
    print(f"Total Validated Records: {doc_count}")
    assert doc_count == 10, f"Expected 10 records, got {doc_count}"

    # Verify first 3 records detail
    for idx, r in enumerate(records[:3]):
        print(f"\n  Record #{idx + 1}:")
        print(f"    Doc ID: {r['doc_id']}")
        print(f"    Title: {r['title']}")
        print(f"    Type: {r['doc_type']} ({r['file_extension']})")
        print(f"    Custodian: {r['custodian']}")
        print(f"    Privilege: {r['privilege_status']} (Basis: {r['privilege_basis']})")
        print(f"    Responsiveness: {r['responsiveness']}")
        print(f"    Tags: {r['issue_tags']}")
        assert r["doc_id"].startswith(dataset_id), f"Doc ID {r['doc_id']} mismatch with {dataset_id}"
        assert r["synthetic_marker"] == "SYNTHETIC_EVAL_RECORD"

    # 4. MongoDB Database Persistence Verification
    print("\n[Step 4] Verifying MongoDB Database Persistence...")
    db = get_database()
    saved_ds = db.datasets.find_one({"dataset_id": dataset_id})
    assert saved_ds is not None, f"Dataset {dataset_id} not found in MongoDB datasets collection!"
    assert len(saved_ds["records"]) == 10, "Record count in MongoDB mismatch!"
    
    # Check generation_jobs collection
    saved_job = db.generation_jobs.find_one({"dataset_id": dataset_id})
    assert saved_job is not None, f"Generation job for {dataset_id} not logged in generation_jobs collection!"
    print(f"MongoDB datasets document confirmed. Job ID: {saved_job['job_id']}, Status: {saved_job['generation_status']}")
    print("PASS: MongoDB persistence verified.")

    # 5. Dataset Retrieval Endpoint
    print("\n[Step 5] Testing GET /api/datasets/{dataset_id}...")
    fetch_resp = client.get(f"/api/datasets/{dataset_id}")
    assert fetch_resp.status_code == 200
    fetched_data = fetch_resp.json()
    assert fetched_data["dataset_id"] == dataset_id
    assert len(fetched_data["records"]) == 10
    print("PASS: Dataset retrieval verified.")

    # 6. Record Editing & Update Persistence
    print("\n[Step 6] Testing PATCH /api/datasets/{dataset_id}/records/{doc_id}...")
    target_doc_id = records[0]["doc_id"]
    new_title = "UPDATED BY COUNSEL: Executive Forensic Ledger Review"
    patch_resp = client.patch(
        f"/api/datasets/{dataset_id}/records/{target_doc_id}",
        json={"title": new_title, "responsiveness": "Responsive"}
    )
    assert patch_resp.status_code == 200, f"PATCH failed: {patch_resp.text}"

    # Verify update persisted in DB
    refetched = client.get(f"/api/datasets/{dataset_id}").json()
    updated_doc = next(r for r in refetched["records"] if r["doc_id"] == target_doc_id)
    assert updated_doc["title"] == new_title, "Updated title did not persist!"
    print(f"Verified Doc {target_doc_id} title successfully updated to: '{updated_doc['title']}'")
    print("PASS: Record update and persistence verified.")

    # 7. Dataset Analytics Generation
    print("\n[Step 7] Testing GET /api/analytics/{dataset_id}...")
    analytics_resp = client.get(f"/api/analytics/{dataset_id}")
    assert analytics_resp.status_code == 200
    analytics_data = analytics_resp.json()
    print("Categories distribution:", analytics_data["category_distribution"])
    print("Privilege distribution:", analytics_data["privilege_distribution"])
    print("Responsiveness distribution:", analytics_data["responsiveness_distribution"])
    print("Top issue tags:", analytics_data["top_tags"])
    assert analytics_data["total_documents"] == 10
    print("PASS: Analytics calculations verified.")

    # 8. Export Functionality (CSV & JSON)
    print("\n[Step 8] Testing Export Endpoints (CSV & JSON)...")
    csv_resp = client.get(f"/api/datasets/{dataset_id}/export/csv")
    assert csv_resp.status_code == 200
    assert "text/csv" in csv_resp.headers["content-type"]
    csv_lines = [line for line in csv_resp.text.strip().split("\n") if line]
    print(f"CSV Header: {csv_lines[0][:80]}...")
    print(f"Total CSV lines: {len(csv_lines)} (1 header + 10 data rows)")
    assert len(csv_lines) == 11, f"Expected 11 lines in CSV, got {len(csv_lines)}"

    json_resp = client.get(f"/api/datasets/{dataset_id}/export/json")
    assert json_resp.status_code == 200
    exported_json = json.loads(json_resp.text)
    assert exported_json["dataset_id"] == dataset_id
    assert len(exported_json["records"]) == 10
    print("PASS: CSV and JSON exports verified.")

    print("\n" + "=" * 70)
    print("ALL 8 VERIFICATION STEPS COMPLETED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    run_verification()
