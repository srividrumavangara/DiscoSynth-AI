# DiscoSynth AI – Synthetic Litigation Metadata Generator

**University Capstone Project: Generative AI + Legal Technology Full-Stack System**  
**Domain:** Electronic Discovery (E-Discovery) Benchmarking & Model Evaluation  
**Generative AI Core:** Google Gemini (`gemini-2.5-flash` / `gemini-1.5-flash`) via structured JSON output and self-correction loops

---

## 1. Problem Statement & Motivation

In electronic discovery (e-discovery), legal technology teams and researchers benchmark document classification models (such as Technology-Assisted Review / TAR, attorney-client privilege detectors, responsiveness classifiers, and issue taggers).

However:
1. **Strict Confidentiality:** Real litigation records contain sensitive trade secrets, PII, and attorney work-product. Access to real case files is legally protected and unavailable for academic research.
2. **Extreme Class Imbalance:** Privileged documents represent small, specialized subsets (typically 5–25%) in real litigation, making model calibration difficult without diverse scenarios.
3. **Non-Replicable Benchmarks:** Proprietary datasets cannot be published or shared for peer-reviewed evaluation.

**DiscoSynth AI** addresses this challenge by generating authentic, structured, and logically consistent **synthetic litigation document metadata** using Generative AI. It generates rich metadata structures (Bates/Doc IDs, custodians, email threads, privilege classifications, responsiveness, and issue tags) without exposing real-world confidential records.

---

## 2. System Architecture

```
                          +-------------------------------------------------------+
                          |                   DiscoSynth AI UI                    |
                          |  React + Vite + Tailwind CSS + TypeScript + Recharts  |
                          +---------------------------+---------------------------+
                                                      |
                                                      | REST API (HTTP / JSON)
                                                      v
+-------------------------------------------------------------------------------------------------+
|                                         FastAPI Backend                                         |
|                                                                                                 |
|  [ Routes ]           /api/health       /api/scenario/interpret     /api/generation/generate    |
|                       /api/datasets     /api/analytics              /api/export                 |
|                                                                                                 |
|  [ GenAI Engine ]     PromptService (Contextual Prompts) <-> GeminiService (Google Gemini API)  |
|                                                                                                 |
|  [ Validation Loop ]  ValidationService (Pydantic Schema & Temporal Consistency Verification)   |
|                                                      |                                          |
|                                         [ LLM Correction Retry ]                                |
|                                                                                                 |
|  [ Analytics & Export] AnalyticsService (Distributions) <-> ExportService (e-discovery CSV/JSON)|
+-----------------------------------------------------+-------------------------------------------+
                                                      |
                                                      | PyMongo / Motor
                                                      v
                                        +---------------------------+
                                        |   MongoDB (Local / Atlas) |
                                        |   Collection: `datasets`  |
                                        +---------------------------+
```

---

## 3. Technology Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS | High-performance, responsive legal-tech SaaS UI |
| **Data Visualization** | Recharts, Lucide React | Interactive distribution charts (categories, custodians, privilege, responsiveness, timeline) |
| **Backend API** | Python 3.13, FastAPI, Uvicorn, Pydantic v2 | High-throughput async REST API with rigorous schema validation |
| **Generative AI** | Google Gemini API (`google-genai` / `google-generativeai`) | Context-aware synthetic generation & NL scenario interpretation |
| **Database** | MongoDB (Local / Atlas), PyMongo | Document database for dataset persistence and indexing |
| **Data Processing** | Pandas, Python JSON / CSV | e-discovery compliant exports |
| **Testing** | Pytest, FastApi TestClient | Automated backend unit and integration test suite |

---

## 4. Key Generative AI Implementations

### A. Context-Aware Prompt Engineering
The system avoids generic dummy records by injecting:
- **Case Background Context:** Fictional parties, disputes, and regulatory bodies (e.g. *In re Meridian Global Securities Litigation*).
- **Core Fictional Custodians:** Persistent corporate officers (CFO, General Counsel, VP Audit) with matching email domains.
- **Strict Boundary Constraints:** Date ranges, allowed document categories, target privilege ratios, and responsiveness ratios.

### B. Controlled Batch Generation
To eliminate LLM token truncation and output degradation:
- Large requests are split into batches of $\le 25$ documents.
- Bates document IDs are sequenced deterministically across batches (e.g., `DS-2026-X9A-0001` to `DS-2026-X9A-0050`).

### C. Automated Schema Validation & Self-Correction
1. Every record is parsed through Pydantic `DocumentMetadata` schemas.
2. Checks temporal validity ($start\_date \le creation\_date \le end\_date$), category whitelists, and privilege consistency (a privileged document must have a valid legal `privilege_basis`).
3. If errors occur, the validation report is fed back to Gemini in a targeted correction prompt (up to 2 retries).

### D. Natural Language Scenario Interpreter
Users can describe complex cases in plain English (e.g., *"Simulate a high-complexity corporate accounting fraud involving whistleblower memos and outside counsel communications"*). Gemini extracts parameters and loads them directly into the generator form.

---

## 5. Quick Start & Setup Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Local MongoDB (`mongod`) or a MongoDB Atlas connection string
- Google Gemini API key (free from [Google AI Studio](https://aistudio.google.com/))

### Step 1: Clone and Configure Environment
```bash
cd /Users/vidruma/discosynth-ai

# Open backend/.env and add your Gemini API key:
nano backend/.env
# or edit with your favorite text editor
```
In `backend/.env`:
```ini
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=discosynth_ai
```

### Step 2: Start Backend
In a terminal window:
```bash
./start_backend.sh
```
*The script automatically verifies/starts the local MongoDB daemon and launches the FastAPI server on `http://localhost:8000` (API documentation available at `http://localhost:8000/docs`).*

### Step 3: Start Frontend
In a separate terminal window:
```bash
./start_frontend.sh
```
*Vite will start the React UI on `http://localhost:5173`.*

---

## 6. Running Tests & Verification

### Run Backend Pytest Suite
```bash
cd backend
source venv/bin/activate
PYTHONPATH=. pytest -v
```
All 9 unit and integration tests verify schema validation, date bounds, privilege rationale constraints, and API health endpoints.

### Run Frontend Production Build
```bash
cd frontend
npm run build
```
Builds and verifies the full TypeScript bundle with zero compiler errors.

---

## 7. Viva & Project Defense Guide (University Evaluation)

### Q1: Why generate synthetic metadata rather than full document texts?
**Answer:** In e-discovery classification research, machine learning models (TAR and metadata classifiers) primarily evaluate custodian communication graphs, timeline bursts, file formats, and privilege logs. Generating metadata keeps generation fast, prevents token limits, and directly reflects real litigation databases (e.g., Relativity, Concordance).

### Q2: How does the application prevent hallucinations and invalid records?
**Answer:** We enforce structured JSON output at the LLM level and pass all output through a Pydantic validation engine (`ValidationService`). The engine verifies date intervals, category whitelists, and logical relationships (e.g., requiring a legal privilege basis if `privilege_status` is not `Not Privileged`). If malformed records occur, an automated correction prompt requests targeted repairs from Gemini.

### Q3: How do you handle large dataset generation without truncation?
**Answer:** We implement controlled batch generation (`GenerationService`). Large requests (e.g., 50 or 100 documents) are divided into batches of up to 25 records. Fictional case context (custodian names, corporate entities, date boundaries) is preserved across batches, while sequential Bates numbering is maintained continuously.

### Q4: How is data persisted and visualized?
**Answer:** Validated datasets are stored in MongoDB in the `datasets` collection with indexing on `dataset_id` and `created_at`. The frontend queries backend aggregation endpoints (`AnalyticsService`) to render interactive Recharts visualizations (pie charts, vertical bar charts, and timeline area charts).

---

## 8. License & Academic Disclaimer
Developed for university academic evaluation. All generated litigation names, entities, custodians, and communications are entirely synthetic and fictional.
