import os, subprocess, base64

def get_base64_img(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            data = base64.b64encode(f.read()).decode("utf-8")
            ext = path.split(".")[-1]
            return f"data:image/{ext};base64,{data}"
    return ""

def generate_pdf():
    img_sb = get_base64_img("docs_assets/header_logo_0_X7.png")
    img_sw = get_base64_img("docs_assets/header_logo_1_X10.png")
    img_arch = get_base64_img("docs_assets/architecture_diagram.png")
    img_er = get_base64_img("docs_assets/er_diagram.png")
    img_aistudio = get_base64_img("docs_assets/gemini_aistudio.png")
    img_tree = get_base64_img("docs_assets/vscode_project_tree.png")
    img_terminal = get_base64_img("docs_assets/terminal_verification.png")
    img_landing = get_base64_img("docs_assets/screenshot_landing.png")
    img_dash = get_base64_img("docs_assets/screenshot_dashboard.png")
    img_gen = get_base64_img("docs_assets/screenshot_generator.png")
    img_prev = get_base64_img("docs_assets/screenshot_preview.png")
    img_analytics = get_base64_img("docs_assets/screenshot_analytics.png")
    img_history = get_base64_img("docs_assets/screenshot_history.png")

    header_markup = f'''
        <div class="page-header">
            <img src="{img_sb}" style="height: 38px;" alt="SmartBridge Logo" />
            <img src="{img_sw}" style="height: 32px;" alt="Skill Wallet Logo" />
        </div>
    '''

    raw_html = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>DiscoSynth AI - Project Documentation</title>
    <style>
        @page {
            size: letter;
            margin: 18mm 16mm 20mm 16mm;
            @bottom-right {
                content: counter(page);
                font-family: Arial, sans-serif;
                font-size: 9pt;
                color: #64748B;
            }
        }
        body {
            font-family: Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 10pt;
            line-height: 1.5;
            color: #334155;
            margin: 0;
            padding: 0;
            background: #FFFFFF;
        }
        .page-break {
            page-break-before: always;
        }
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #E2E8F0;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        h1 {
            font-size: 20pt;
            font-weight: 700;
            color: #0F172A;
            text-align: center;
            margin: 10px 0 8px 0;
            line-height: 1.25;
        }
        .subtitle {
            text-align: center;
            font-size: 11pt;
            font-weight: 600;
            color: #2563EB;
            margin-bottom: 10px;
        }
        .team-box {
            text-align: center;
            margin-bottom: 22px;
            padding: 8px 16px;
            background: #F8FAFC;
            border-radius: 8px;
            border: 1px solid #E2E8F0;
        }
        .team-box .label {
            font-size: 10.5pt;
            font-weight: 700;
            color: #0F172A;
            margin-bottom: 4px;
        }
        .team-box .members {
            font-size: 11pt;
            font-weight: 700;
            color: #1E293B;
        }
        h2 {
            font-size: 13.5pt;
            font-weight: 700;
            color: #0F172A;
            margin-top: 18px;
            margin-bottom: 8px;
            border-bottom: 1px solid #F1F5F9;
            padding-bottom: 4px;
        }
        h3 {
            font-size: 11.5pt;
            font-weight: 700;
            color: #1E293B;
            margin-top: 14px;
            margin-bottom: 6px;
        }
        p {
            margin-top: 0;
            margin-bottom: 10px;
            text-align: justify;
        }
        ul {
            margin-top: 4px;
            margin-bottom: 12px;
            padding-left: 20px;
        }
        li {
            margin-bottom: 4px;
        }
        .scenario-box {
            margin-bottom: 12px;
        }
        .scenario-title {
            font-weight: 700;
            color: #0F172A;
        }
        .fig-container {
            text-align: center;
            margin: 12px 0 16px 0;
        }
        .fig-img {
            max-width: 95%;
            height: auto;
            border-radius: 6px;
            border: 1px solid #E2E8F0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.04);
        }
        .fig-caption {
            font-size: 9pt;
            font-style: italic;
            color: #64748B;
            margin-top: 6px;
        }
        .code-block {
            background: #1E1E1E;
            color: #D4D4D4;
            font-family: "Courier New", Courier, monospace;
            font-size: 9pt;
            line-height: 1.4;
            padding: 12px 14px;
            border-radius: 6px;
            margin: 10px 0 14px 0;
            white-space: pre-wrap;
            overflow-x: auto;
            border: 1px solid #333333;
        }
        .code-comment { color: #6A9955; }
        .code-keyword { color: #569CD6; }
        .code-string { color: #CE9178; }
        .alert-important {
            background: #FEF2F2;
            border-left: 4px solid #DC2626;
            padding: 8px 12px;
            font-size: 9.5pt;
            color: #991B1B;
            margin: 10px 0;
            border-radius: 0 4px 4px 0;
        }
        .note-text {
            font-size: 9pt;
            font-style: italic;
            color: #2563EB;
            margin-bottom: 8px;
        }
    </style>
</head>
<body>

    <!-- PAGE 1: TITLE & PROJECT DESCRIPTION -->
    {{PAGE_HEADER}}

    <h1>DiscoSynth AI: AI-Powered Synthetic Litigation<br/>Metadata Generator</h1>
    <div class="subtitle">University Academic Capstone Project | Full-Stack Generative AI System</div>
    
    <div class="team-box">
        <div class="label">Project Team Members:</div>
        <div class="members">Sri Vidruma Vangara &mdash; AP24110010421 &nbsp;&nbsp;|&nbsp;&nbsp; Amrutha Anala &mdash; AP24110010985</div>
    </div>

    <h2>Project Description:</h2>
    <p>
        DiscoSynth AI harnesses Generative AI to provide intelligent, structured synthetic litigation document metadata generation, offering legal technology researchers, data scientists, and QA engineers an authentic, statistically robust benchmark creation platform. In electronic discovery (e-discovery), classification models—such as Technology-Assisted Review (TAR), attorney-client privilege detectors, confidentiality triage filters, and responsiveness classifiers—require diverse datasets to evaluate and calibrate their predictive accuracy. However, actual corporate litigation files are strictly confidential, subject to attorney-client privilege, work-product doctrine, and data privacy regulations (GDPR, CCPA), making authentic datasets unavailable for research and academic benchmarking.
    </p>
    <p>
        DiscoSynth AI solves this fundamental data availability bottleneck by generating fictional, realistic, and logically consistent litigation metadata without copying or exposing any confidential real-world legal case records. The platform features an AI-Assisted Natural Language Scenario Interpreter that parses unstructured factual prompts into structured litigation parameters, a Controlled Batch Generator producing sequential Bates numbering, fictional custodian communication graphs, privilege justifications, and responsiveness classifications, a multi-tier Pydantic Validation & Automated Repair Loop, and an interactive Analytics & Visualization dashboard with real-time database aggregations.
    </p>
    <p>
        Utilizing Google's official Google GenAI Python SDK (<code>google-genai</code>) interacting with the Gemini 3.8 Flash model (with automated failover protection across active Gemini Flash models), DiscoSynth AI generates structured JSON metadata conforming strictly to e-discovery production norms. Built with a high-performance FastAPI backend and a modern React.js (Vite + Tailwind CSS + Recharts) frontend, the platform persists datasets and generation audits into MongoDB Atlas (with local MongoDB support), enabling seamless filtering, inline record editing, and standard e-discovery CSV and JSON exports.
    </p>

    <h2>Scenarios</h2>
    <div class="scenario-box">
        <span class="scenario-title">Scenario 1 (Corporate Accounting Fraud): </span>
        A regulatory investigator or corporate legal team specifies an accounting fraud scenario involving off-balance-sheet debt, unrecorded liabilities, and altered audit schedules. DiscoSynth AI infers the legal scenario, synthesizes key corporate entities (<em>Titan Global Solutions Inc.</em>, <em>Sterling & Croft LLP Outside Counsel</em>, <em>Apex Assurance Auditors</em>), and generates realistic financial ledgers, email exchanges debating audit findings, board audit committee memoranda, and attorney-client privileged legal risk evaluations, complete with sequential Bates IDs (e.g., <code>DS-2026-BDCD0-0001</code> through <code>0010</code>).
    </div>
    <div class="scenario-box">
        <span class="scenario-title">Scenario 2 (Intellectual Property & Trade Secret Theft): </span>
        A patent litigation firm configures a high-stakes trade secret misappropriation dispute where a former VP of Engineering exfiltrated proprietary neural-compression algorithms to a market competitor prior to resigning. The system synthesizes source code repository commit notices, personal email forwardings, forensic IT departure audit memos, non-disclosure agreements (NDAs), and non-responsive personal communications, calibrating realistic privilege and responsiveness ratios.
    </div>
    <div class="scenario-box">
        <span class="scenario-title">Scenario 3 (Employment Discrimination & Retaliation): </span>
        An employment law researcher benchmarks a classifier on internal workplace harassment, unequal compensation, and whistleblower retaliation claims. DiscoSynth AI generates internal HR investigation reports, encrypted chat logs, performance evaluation sheets, executive committee minutes, and attorney work-product privilege justifications asserting confidentiality in anticipation of litigation.
    </div>

    <!-- PAGE 2: TECHNICAL ARCHITECTURE & DATABASE ER DIAGRAM -->
    <div class="page-break"></div>
    {{PAGE_HEADER}}

    <h2>Technical Architecture:</h2>
    <div class="fig-container">
        <img src="{{IMG_ARCH}}" class="fig-img" style="max-height: 290px;" alt="Technical Architecture" />
        <div class="fig-caption">Figure 1: DiscoSynth AI Multi-Tier System Architecture</div>
    </div>
    <p>
        <strong>Description:</strong> DiscoSynth AI utilizes a modular, asynchronous three-tier architecture engineered for enterprise legal-tech performance. The presentation tier provides a responsive Single Page Application (SPA) built with React 18, Vite, Tailwind CSS, Lucide icons, and Recharts for interactive analytics. The application tier is powered by a high-performance Python FastAPI backend that orchestrates RESTful communication, Pydantic v2 data validation, dynamic prompt engineering, and automated error-correction loops. It interfaces directly with Google's official Google GenAI Python SDK (<code>google-genai</code>) to invoke Gemini 3.8 Flash with structured JSON enforcement and resilient multi-model failover. The persistence tier utilizes MongoDB Atlas (and local MongoDB daemon for offline development) storing structured collections for datasets and generation jobs.
    </p>

    <h2>Database Entity-Relationship (ER) Diagram & Schema:</h2>
    <div class="note-text">(Note: Document database schema and relational references between datasets and generation_jobs collections)</div>
    <div class="fig-container">
        <img src="{{IMG_ER}}" class="fig-img" style="max-height: 270px;" alt="Database ER Diagram" />
        <div class="fig-caption">Figure 2: MongoDB Entity-Relationship (ER) Schema Diagram</div>
    </div>
    <p>
        <strong>Database Architecture Description:</strong> The persistence layer uses MongoDB with two indexed collections:<br/>
        1. <strong>datasets Collection:</strong> Stores each generated litigation dataset containing <code>dataset_id</code> (unique indexed Bates identifier), dataset name, scenario classification, factual scenario description, generation configuration (size, complexity, date range, ratios), the full array of validated <code>DocumentMetadata</code> records (doc_id, title, filename, file_extension, size, timestamps, custodian, author, recipient, privilege_status, privilege_basis, responsiveness, confidentiality, tags, synthetic_marker), model metadata (model_name, provider, sdk), validation status, and creation timestamps.<br/>
        2. <strong>generation_jobs Collection:</strong> Acts as an operational audit ledger capturing <code>job_id</code> (unique indexed job identifier), <code>dataset_id</code> (foreign key reference to datasets.dataset_id), generation status ('completed', 'failed', 'in_progress'), requested vs completed document counts, batch execution progress, total duration in seconds, error logs, and timestamps.
    </p>

    <h3>Pre-requisites:</h3>
    <ul>
        <li><strong>FastAPI Framework Knowledge:</strong> <a href="https://fastapi.tiangolo.com/">FastAPI Documentation</a></li>
        <li><strong>Google GenAI SDK & Gemini API Familiarity:</strong> <a href="https://ai.google.dev/gemini-api/docs">Google AI Studio Gemini API Docs</a></li>
        <li><strong>React.js, TypeScript & Tailwind CSS Skills:</strong> <a href="https://react.dev/">React Docs</a> | <a href="https://tailwindcss.com/">Tailwind CSS</a></li>
        <li><strong>MongoDB & PyMongo Database Proficiency:</strong> <a href="https://www.mongodb.com/docs/">MongoDB Documentation</a></li>
        <li><strong>Pydantic v2 Data Modeling & Validation:</strong> <a href="https://docs.pydantic.dev/">Pydantic v2 Docs</a></li>
        <li><strong>Recharts Data Visualization Library:</strong> <a href="https://recharts.org/">Recharts Docs</a></li>
        <li><strong>Version Control with Git & GitHub:</strong> <a href="https://git-scm.com/doc">Git Documentation</a></li>
    </ul>

    <!-- PAGE 3: PROJECT WORKFLOW -->
    <div class="page-break"></div>
    {{PAGE_HEADER}}

    <h2>Project Workflow:</h2>
    
    <h3>Milestone 1: Model Selection and Architecture</h3>
    <ul>
        <li><strong>Activity 1.1:</strong> Generate a Google Gemini API Key and configure it securely in the backend environment.</li>
        <li><strong>Activity 1.2:</strong> Research and select the appropriate Generative AI model from Google (Gemini 3.8 Flash with multi-model fallback).</li>
        <li><strong>Activity 1.3:</strong> Define the architecture of the application, detailing interactions between the React frontend, FastAPI backend, GenAI engine, and MongoDB.</li>
        <li><strong>Activity 1.4:</strong> Set up the development environment, installing necessary libraries and dependencies for FastAPI, PyMongo, and the Google GenAI SDK.</li>
    </ul>

    <h3>Milestone 2: Core Functionalities Development</h3>
    <ul>
        <li><strong>Activity 2.1:</strong> Develop the core functionalities: Natural Language Scenario Interpreter, Controlled Batch Metadata Generator, and Pydantic Validation & Repair Engine.</li>
        <li><strong>Activity 2.2:</strong> Implement the FastAPI backend to manage routing, input schema validation, sequential Bates numbering, and asynchronous job tracking.</li>
    </ul>

    <h3>Milestone 3: Backend API & Service Development</h3>
    <ul>
        <li><strong>Activity 3.1:</strong> Write the main application logic across modular services (<code>gemini_service.py</code>, <code>prompt_service.py</code>, <code>generation_service.py</code>, <code>validation_service.py</code>, <code>analytics_service.py</code>, <code>export_service.py</code>) establishing endpoints for generation, retrieval, editing, and analytics.</li>
    </ul>

    <h3>Milestone 4: Frontend Development</h3>
    <ul>
        <li><strong>Activity 4.1:</strong> Design and develop the user interface using React 18, Vite, TypeScript, and Tailwind CSS, creating a modern legal-tech design with Recharts analytics.</li>
        <li><strong>Activity 4.2:</strong> Implement asynchronous API state management with Axios, connecting the frontend to FastAPI endpoints for scenario parsing, dataset generation, inline record editing, and CSV/JSON exports.</li>
    </ul>

    <h3>Milestone 5: Deployment, Testing & Verification</h3>
    <ul>
        <li><strong>Activity 5.1:</strong> Prepare the application for local deployment by configuring the MongoDB daemon, virtual environment, and startup scripts (<code>start_backend.sh</code> and <code>start_frontend.sh</code>).</li>
        <li><strong>Activity 5.2:</strong> Execute comprehensive verification: run the backend Pytest suite (9 tests passing), build the production frontend bundle, and run live end-to-end generation verifying all 8 steps without mocks.</li>
        <li><strong>Activity 5.3:</strong> Deploy and publish the project to GitHub repository (<a href="https://github.com/srividrumavangara/DiscoSynth-AI">https://github.com/srividrumavangara/DiscoSynth-AI</a>) with production deployment configurations for Render, Vercel, and MongoDB Atlas.</li>
    </ul>

    <h3>Milestone 6: Conclusion</h3>
    <ul>
        <li>Summarize the technical and academic achievements of DiscoSynth AI, evaluate e-discovery model benchmarking impact, address ethical boundaries, and outline future enhancements.</li>
    </ul>

    <!-- PAGE 4: MILESTONE 1 -->
    <div class="page-break"></div>
    {{PAGE_HEADER}}

    <h2>Milestone 1: Model Selection and Architecture</h2>
    <p>
        In this milestone, we focus on selecting the appropriate Generative AI model from Google for our synthetic litigation metadata generation needs. This involves researching the capabilities, context windows, and structured JSON output performance of Google's latest models, ensuring that the chosen model aligns with the rigorous demands of e-discovery document metadata (Bates IDs, custodians, privilege, responsiveness, and issue tags).
    </p>

    <h3>Activity 1.1: Generate a Google Gemini API Key</h3>
    <p>
        Before the application can communicate with the Gemini LLM, you need a valid Google Gemini API key. Follow the steps below to create one and connect it securely to the project:
    </p>
    <ul>
        <li><strong>Step 1 &mdash; Create a Google AI Studio Account:</strong> Visit <a href="https://aistudio.google.com">https://aistudio.google.com</a> and sign in using your Google account.</li>
        <li><strong>Step 2 &mdash; Navigate to Get API Key:</strong> Click on "Get API key" from the left sidebar navigation menu.</li>
        <li><strong>Step 3 &mdash; Create a New API Key:</strong> Click the "+ Create API key" button. Select an existing Google Cloud Project or click "Create API key in new project".</li>
        <li><strong>Step 4 &mdash; Secure Your API Key:</strong> Copy the generated API key string immediately and store it securely.</li>
    </ul>

    <div class="fig-container">
        <img src="{{IMG_AISTUDIO}}" class="fig-img" style="max-height: 240px;" alt="Google AI Studio API Key Console" />
        <div class="fig-caption">Figure 3: Google AI Studio API Key Management Console</div>
    </div>

    <p><strong>Step 5 &mdash; Add the Key to Your Project:</strong> Create a <code>.env</code> file in the backend directory (<code>backend/.env</code>) and configure the API key and model parameters:</p>
    <div class="code-block"><span class="code-comment"># backend/.env</span>
GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxAkQ
GEMINI_MODEL=gemini-3.8-flash
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=discosynth_ai
PORT=8000
ENVIRONMENT=development</div>

    <p><strong>Step 6 &mdash; Verify Key Loading via Pydantic Settings:</strong> The application loads the key securely at backend startup using <code>pydantic-settings</code> in <code>backend/app/config.py</code>. The key is never exposed to the client or browser:</p>
    <div class="code-block"><span class="code-comment"># backend/app/config.py</span>
<span class="code-keyword">from</span> pydantic_settings <span class="code-keyword">import</span> BaseSettings, SettingsConfigDict

<span class="code-keyword">class</span> Settings(BaseSettings):
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = <span class="code-string">"gemini-3.8-flash"</span>
    MONGODB_URI: str = <span class="code-string">"mongodb://localhost:27017"</span>
    DATABASE_NAME: str = <span class="code-string">"discosynth_ai"</span>
    model_config = SettingsConfigDict(env_file=<span class="code-string">".env"</span>, extra=<span class="code-string">"ignore"</span>)

settings = Settings()</div>

    <div class="alert-important">
        <strong>Important &mdash; Never Commit Your API Key:</strong> The root <code>.gitignore</code> file strictly excludes <code>backend/.env</code>, preventing any accidental credential leakage to public repositories.
    </div>

    <!-- PAGE 5: MILESTONE 1 CONTINUED -->
    <div class="page-break"></div>
    {{PAGE_HEADER}}

    <h3>Activity 1.2: Research and Select the Appropriate Generative AI Model</h3>
    <p>Here are the core criteria and engineering evaluations conducted to select the optimal model for DiscoSynth AI:</p>
    <ul>
        <li><strong>Model Deprecation Migration:</strong> During testing, Google officially deprecated <code>gemini-2.5-flash</code> for new users (returning HTTP 404), explicitly recommending migration to <code>gemini-3.8-flash</code> and the official <code>google-genai</code> Python SDK.</li>
        <li><strong>Evaluate Model Performance:</strong> Gemini 3.8 Flash delivers sub-second token generation latency, a 1-million-token context window, and superior JSON schema instruction following compared to legacy models.</li>
        <li><strong>Resilient Multi-Model Fallback Queue:</strong> To prevent application downtime during Google's demand surges (HTTP 503) or rate limits (HTTP 429), we engineered an automated fallback queue in <code>GeminiService</code>: <code>gemini-3.8-flash</code> &rarr; <code>gemini-3.5-flash</code> &rarr; <code>gemini-3.1-flash-lite</code>. This ensures generation requests succeed reliably while recording the exact model used in the dataset metadata.</li>
        <li><strong>SDK Selection:</strong> Migrated from legacy <code>google-generativeai</code> to the official Google GenAI Python SDK (<code>google-genai</code>) configured with <code>types.HttpOptions(timeout=30000)</code> and <code>response_mime_type="application/json"</code>.</li>
    </ul>

    <h3>Activity 1.3: Define the Architecture of the Application</h3>
    <ul>
        <li><strong>Client-Side Responsibilities:</strong> React frontend captures scenario parameters, custodians, date spans, and privilege ratios; renders interactive Recharts visualizations (bar, donut, and area charts); supports 6-column tabular filtering; and provides modal inline editing for document records.</li>
        <li><strong>Backend Responsibilities:</strong> FastAPI coordinates validation of incoming payloads via Pydantic schemas, builds context-aware prompts in <code>PromptService</code>, manages controlled batch splitting (up to 25 documents per batch) in <code>GenerationService</code>, and computes analytical distributions in <code>AnalyticsService</code>.</li>
        <li><strong>AI Integration Points:</strong> <code>GeminiService</code> connects via Google GenAI Client with <code>temperature=0.3</code> for high structural fidelity, enforces strict JSON schema output, and executes an automated repair loop (max 2 attempts) if records fail Pydantic validation checks.</li>
    </ul>

    <h3>Activity 1.4: Set Up the Development Environment</h3>
    <ul>
        <li><strong>Python Virtual Environment & Dependencies:</strong>
            <br/><code>$ cd backend && python3 -m venv venv && source venv/bin/activate</code>
            <br/><code>$ pip install -r requirements.txt</code> (fastapi, uvicorn, pydantic, pymongo, google-genai, pandas, pytest)
        </li>
        <li><strong>Frontend Node Environment:</strong>
            <br/><code>$ cd frontend && npm install</code> (react, vite, tailwindcss, recharts, lucide-react, axios)
        </li>
        <li><strong>Application Directory Structure:</strong> Structured as a clean monorepo separating frontend, backend, local MongoDB data, and automated scripts:</li>
    </ul>

    <div class="fig-container">
        <img src="{{IMG_TREE}}" class="fig-img" style="max-height: 250px;" alt="VS Code Project Tree" />
        <div class="fig-caption">Figure 4: DiscoSynth AI Project Directory Structure in VS Code</div>
    </div>

    <!-- PAGE 6: MILESTONE 2 -->
    <div class="page-break"></div>
    {{PAGE_HEADER}}

    <h2>Milestone 2: Core Functionalities Development</h2>

    <h3>Activity 2.1: Develop Core Metadata Generation Features</h3>
    <p>Implement the three primary Generative AI generation modules driving DiscoSynth AI:</p>
    <ul>
        <li><strong>Module 1 &mdash; Natural Language Scenario Interpreter:</strong> Evaluates unstructured litigation briefs, news summaries, or case outlines. Gemini infers formal case metadata: inferred litigation category (Corporate Fraud, Intellectual Property, Employment, Contract, etc.), formal case caption, roster of 4&ndash;6 key corporate and legal entities, and 3&ndash;5 core legal issues/claims.</li>
        <li><strong>Module 2 &mdash; Controlled Batch Metadata Generator:</strong> Generates realistic e-discovery metadata in controlled batches of up to 25 records. Enforces sequential Bates numbering (e.g., <code>DS-2026-BDCD0-0001</code>), custodian email communication graphs, realistic timestamps, document types (Emails, Financial Records, Internal Communications, Contracts, Reports), privilege classifications (Attorney-Client, Work Product, Not Privileged) with required legal basis rationale, confidentiality markings, and responsiveness classifications.</li>
        <li><strong>Module 3 &mdash; Validation & Automated Repair Engine:</strong> Validates every record against Pydantic schemas and semantic rules (date ranges, category whitelist, privilege justification required for privileged documents). If invalid records occur, <code>PromptService</code> generates a targeted repair prompt for Gemini.</li>
    </ul>

    <h3>Activity 2.2: Implement the FastAPI Backend & Routing</h3>
    <p>Define REST API Endpoints in FastAPI:</p>
    <ul>
        <li><code>POST /api/scenario/interpret</code>: Accepts natural-language text and returns inferred scenario parameters and entity rosters.</li>
        <li><code>POST /api/generation/generate</code>: Orchestrates batch generation, Pydantic validation, repair loops, and database persistence into <code>datasets</code> and <code>generation_jobs</code>.</li>
        <li><code>GET /api/datasets</code>: Retrieves paginated dataset summaries from MongoDB for the history and dashboard views.</li>
        <li><code>GET /api/datasets/{dataset_id}</code>: Retrieves complete dataset details including all generated document metadata records.</li>
        <li><code>PATCH /api/datasets/{dataset_id}/records/{doc_id}</code>: Enables inline editing of specific metadata records with MongoDB persistence.</li>
        <li><code>GET /api/analytics/{dataset_id}</code>: Computes real-time aggregation distributions across categories, custodians, privilege, and responsiveness.</li>
        <li><code>GET /api/datasets/{dataset_id}/export/csv</code> and <code>/json</code>: Streams high-fidelity e-discovery CSV and JSON exports for classification benchmarking.</li>
    </ul>

    <!-- PAGE 7: MILESTONE 3 -->
    <div class="page-break"></div>
    {{PAGE_HEADER}}

    <h2>Milestone 3: Backend Application Logic & Services</h2>
    <p><strong>Activity 3.1: Writing Core Application Logic in Backend Services</strong><br/>
    Milestone 3 focuses on implementing modular backend services and API route handlers that power the Generative AI workflow, Pydantic validation, and MongoDB interactions.</p>

    <h3>1. Generation Route Handler (<code>backend/app/routes/generation.py</code>)</h3>
    <div class="code-block">@router.post(<span class="code-string">"/generate"</span>, response_model=DatasetDetail)
<span class="code-keyword">async def</span> generate_dataset(config: GenerationConfig):
    <span class="code-keyword">try</span>:
        <span class="code-comment"># Calls controlled batch generator with Gemini 3.8 Flash & Pydantic validation</span>
        dataset = <span class="code-keyword">await</span> generation_service.generate_dataset(config)
        <span class="code-keyword">return</span> dataset
    <span class="code-keyword">except</span> Exception <span class="code-keyword">as</span> err:
        logger.error(f<span class="code-string">"Dataset generation failed: "</span> + str(err))
        <span class="code-keyword">raise</span> HTTPException(status_code=500, detail=str(err))</div>

    <h3>2. Google GenAI Client & Resilient Invocations (<code>backend/app/services/gemini_service.py</code>)</h3>
    <div class="code-block"><span class="code-keyword">class</span> GeminiService:
    FALLBACK_MODELS = [<span class="code-string">"gemini-3.5-flash"</span>, <span class="code-string">"gemini-3.1-flash-lite"</span>]

    <span class="code-keyword">def</span> __init__(self):
        <span class="code-keyword">from</span> google <span class="code-keyword">import</span> genai
        <span class="code-keyword">from</span> google.genai <span class="code-keyword">import</span> types
        self._client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
            http_options=types.HttpOptions(timeout=30000)
        )

    <span class="code-keyword">def</span> _call_with_resilience(self, prompt: str, system_instruction: str = None):
        <span class="code-keyword">for</span> model_candidate <span class="code-keyword">in</span> [self.model_name] + self.FALLBACK_MODELS:
            <span class="code-keyword">try</span>:
                config = types.GenerateContentConfig(
                    response_mime_type=<span class="code-string">"application/json"</span>,
                    temperature=0.3
                )
                response = self._client.models.generate_content(
                    model=model_candidate, contents=prompt, config=config
                )
                <span class="code-keyword">return</span> response.text, model_candidate
            <span class="code-keyword">except</span> Exception <span class="code-keyword">as</span> e:
                <span class="code-keyword">if</span> <span class="code-string">"503"</span> <span class="code-keyword">in</span> str(e) <span class="code-keyword">or</span> <span class="code-string">"429"</span> <span class="code-keyword">in</span> str(e):
                    <span class="code-keyword">continue</span>  <span class="code-comment"># Failover seamlessly to active fallback model</span>
                <span class="code-keyword">raise</span> e</div>

    <h3>3. E-Discovery Prompt Engineering (<code>backend/app/services/prompt_service.py</code>)</h3>
    <div class="code-block"><span class="code-keyword">def</span> build_batch_prompt(config: GenerationConfig, batch_num: int, batch_size: int, context: dict) -> str:
    <span class="code-keyword">return</span> (
        f<span class="code-string">"Generate exactly "</span> + str(batch_size) + <span class="code-string">" realistic synthetic litigation metadata records in valid JSON.\\n"</span>
        f<span class="code-string">"Scenario: "</span> + str(config.scenario_type) + <span class="code-string">" - "</span> + str(config.scenario_description) + <span class="code-string">"\\n"</span>
        f<span class="code-string">"Bates ID Range: "</span> + str(context["bates_prefix"]) + <span class="code-string">"-"</span> + str(context["start_seq"]) + <span class="code-string">" onwards.\\n"</span>
        f<span class="code-string">"Custodians available: "</span> + <span class="code-string">", "</span>.join(context["custodians"]) + <span class="code-string">"\\n"</span>
        f<span class="code-string">"Privilege Target Ratio: "</span> + str(config.privilege_ratio) + <span class="code-string">"\\n\\n"</span>
        <span class="code-string">"Respond with a JSON object: {\\"records\\": [ { ...DocumentMetadata fields... } ] }\\n"</span>
        <span class="code-string">"Every record MUST include synthetic_marker: 'SYNTHETIC_EVAL_RECORD'."</span>
    )</div>

    <h3>4. Pydantic v2 Document Metadata Schema (<code>backend/app/schemas/metadata_record.py</code>)</h3>
    <div class="code-block"><span class="code-keyword">class</span> DocumentMetadata(BaseModel):
    doc_id: str = Field(description=<span class="code-string">"Sequential Bates ID"</span>)
    filename: str
    title: str
    doc_type: str = Field(description=<span class="code-string">"Email, Financial Records, Internal Communications, etc."</span>)
    file_extension: str
    file_size_kb: int
    creation_date: str
    modified_date: str
    custodian: str
    author: str
    recipient: Optional[str] = None
    privilege_status: str = Field(description=<span class="code-string">"Attorney-Client, Work Product, Not Privileged"</span>)
    privilege_basis: Optional[str] = None
    responsiveness: str = Field(description=<span class="code-string">"Responsive, Non-Responsive"</span>)
    confidentiality: str
    issue_tags: List[str] = []
    synthetic_marker: str = <span class="code-string">"SYNTHETIC_EVAL_RECORD"</span></div>

    <!-- PAGE 8: MILESTONE 4 -->
    <div class="page-break"></div>
    {{PAGE_HEADER}}

    <h2>Milestone 4: Frontend Development</h2>

    <h3>Activity 4.1: Designing and Developing the User Interface</h3>
    <p>
        Milestone 4 focuses on creating an intuitive, highly functional user interface for legal researchers and data scientists. Built with React 18, Vite, and Tailwind CSS, the UI follows a modern dark legal-tech aesthetic (slate-950 background, blue/indigo accent highlights, and crisp borders):
    </p>
    <ul>
        <li><strong>Navigation & System Status Bar:</strong> Displays real-time database connectivity (<code>MongoDB Connected</code>) and active Gemini model status badge (<code>gemini-3.8-flash</code>).</li>
        <li><strong>Landing Page:</strong> Introduces the core e-discovery problem statement, EDRM workflow diagram, and direct navigation to generation tools.</li>
        <li><strong>Interactive Dashboard:</strong> Aggregates real stored metrics from MongoDB—total datasets, total documents, privileged ratios, and recent generation logs.</li>
        <li><strong>Generator Form & NL Scenario Modal:</strong> Allows parameter tuning (size 10–100, complexity, date ranges, custodian lists) and provides an AI Scenario Interpreter modal with one-click corporate fraud and IP theft presets.</li>
        <li><strong>Dataset Preview Table:</strong> Multi-column searchable grid with Bates IDs, custodians, file types, privilege badges, and inline record edit modal.</li>
        <li><strong>Analytics Visualizer:</strong> Recharts-powered dashboard rendering category bar charts, custodian distribution, privilege donut, responsiveness donut, and timeline area charts.</li>
    </ul>

    <h3>Activity 4.2: Asynchronous State Management & API Integration</h3>
    <ul>
        <li><strong>Axios API Client (<code>frontend/src/api/client.ts</code>):</strong> Encapsulates all backend REST endpoints with strict TypeScript typings and automatic error handling.</li>
        <li><strong>Asynchronous Generation Handling:</strong> When the user submits a generation request, the UI displays animated step spinners ("Analyzing scenario...", "Calling Gemini 3.8 Flash...", "Validating schemas...").</li>
        <li><strong>Inline Record Editing & Persistence:</strong> Editing a record in <code>RecordEditModal</code> sends a <code>PATCH</code> request to <code>/api/datasets/{id}/records/{doc_id}</code>, immediately updating the MongoDB document and refreshing the preview table.</li>
        <li><strong>Streamed File Exports:</strong> One-click CSV and JSON download triggers stream the exported files directly from the FastAPI backend to the user's browser.</li>
    </ul>

    <!-- PAGE 9: MILESTONE 5 -->
    <div class="page-break"></div>
    {{PAGE_HEADER}}

    <h2>Milestone 5: Deployment, Testing & Verification</h2>

    <h3>Activity 5.1: Preparing the Application for Local Deployment</h3>
    <p>To run DiscoSynth AI locally, execute the provided startup scripts or launch each service in separate terminal sessions:</p>
    <ul>
        <li><strong>Terminal 1 &mdash; Start MongoDB Daemon & FastAPI Backend:</strong>
            <br/><code>$ ./start_backend.sh</code> (or <code>mongod --dbpath ./mongodb_data --port 27017 && uvicorn app.main:app --port 8000</code>)
        </li>
        <li><strong>Terminal 2 &mdash; Start Vite React Frontend:</strong>
            <br/><code>$ ./start_frontend.sh</code> (or <code>cd frontend && npm run dev -- --port 5173</code>)
        </li>
        <li><strong>System Health Verification:</strong> Access <code>http://localhost:8000/api/health</code> to confirm MongoDB and Gemini status.</li>
    </ul>

    <h3>Activity 5.2: Local Testing, Pytest Suite & E2E Verification</h3>
    <p>Comprehensive testing was conducted on live backend and database infrastructure without mocks:</p>
    <ul>
        <li><strong>Backend Pytest Suite:</strong> All 9 unit and integration tests passed in 1.12 seconds verifying health probes, Gemini connectivity, Pydantic constraints, and date validations.</li>
        <li><strong>Frontend Production Build:</strong> <code>npm run build</code> completed cleanly in 3.79 seconds with 0 TypeScript compiler errors.</li>
        <li><strong>Live End-to-End Verification (<code>verify_e2e.py</code>):</strong> Successfully executed all 8 pipeline steps with 100% success:</li>
    </ul>

    <div class="fig-container">
        <img src="{{IMG_TERMINAL}}" class="fig-img" style="max-height: 250px;" alt="Terminal Verification Results" />
        <div class="fig-caption">Figure 5: Pytest Suite and Complete Live End-to-End Verification Terminal</div>
    </div>

    <h3>Activity 5.3: Version Control & GitHub Repository</h3>
    <p>The entire codebase has been committed and deployed to the GitHub repository under the user's account:</p>
    <ul>
        <li><strong>Repository URL:</strong> <a href="https://github.com/srividrumavangara/DiscoSynth-AI">https://github.com/srividrumavangara/DiscoSynth-AI</a></li>
        <li><strong>Security Measures:</strong> <code>.gitignore</code> ensures <code>backend/.env</code> and API keys are never exposed.</li>
        <li><strong>Cloud Production Deployment:</strong>
            <ul>
                <li><strong>Backend:</strong> Deployable to Render or AWS as a Python 3 Web Service bound to MongoDB Atlas.</li>
                <li><strong>Frontend:</strong> Deployable to Vercel with <code>VITE_API_URL</code> pointing to the production backend.</li>
                <li><strong>Database:</strong> Connect to MongoDB Atlas cluster by updating <code>MONGODB_URI</code> in environment variables.</li>
            </ul>
        </li>
    </ul>

    <!-- PAGE 10: WEB PAGES (LANDING & DASHBOARD) -->
    <div class="page-break"></div>
    {{PAGE_HEADER}}

    <h2>Exploring the Website's Web Pages:</h2>

    <h3>1. Landing Page (Home)</h3>
    <div class="fig-container">
        <img src="{{IMG_LANDING}}" class="fig-img" style="max-height: 280px;" alt="Landing Page" />
        <div class="fig-caption">Figure 6: DiscoSynth AI Landing Page & EDRM Workflow Explainer</div>
    </div>
    <p>
        <strong>Description:</strong> Introduces DiscoSynth AI with a legal-tech SaaS hero section, an explainer of the e-discovery data availability bottleneck, interactive architecture badges, and an EDRM (Electronic Discovery Reference Model) pipeline guide with a direct "Start Generating" CTA button.
    </p>

    <h3>2. Interactive Dashboard Page</h3>
    <div class="fig-container">
        <img src="{{IMG_DASH}}" class="fig-img" style="max-height: 280px;" alt="Interactive Dashboard" />
        <div class="fig-caption">Figure 7: Live Application Dashboard with Real MongoDB Statistics</div>
    </div>
    <p>
        <strong>Description:</strong> Real-time operational dashboard displaying live metrics aggregated from MongoDB: total datasets generated, total synthetic documents, active litigation scenario count, privilege vs non-privileged document ratio, and responsiveness distribution. Includes a system health indicator card verifying active Gemini model and MongoDB connectivity.
    </p>

    <!-- PAGE 11: WEB PAGES (GENERATOR & PREVIEW) -->
    <div class="page-break"></div>
    {{PAGE_HEADER}}

    <h3>3. Synthetic Dataset Generator & NL Scenario Modal</h3>
    <div class="fig-container">
        <img src="{{IMG_GEN}}" class="fig-img" style="max-height: 280px;" alt="Generator Form" />
        <div class="fig-caption">Figure 8: Synthetic Dataset Parameter Generator Form</div>
    </div>
    <p>
        <strong>Description:</strong> The primary generation control center. Allows users to select litigation scenarios (Corporate Fraud, IP Theft, Employment, etc.), configure dataset size (10, 25, 50, 100), adjust complexity levels, define date spans, set custom custodians, and adjust target privilege ratios. Features the "AI Assist: Interpret Scenario" modal button that invokes Gemini to automatically parse case narratives into parameter sets.
    </p>

    <h3>4. Bates Dataset Preview Table & Inline Record Editor</h3>
    <div class="fig-container">
        <img src="{{IMG_PREV}}" class="fig-img" style="max-height: 280px;" alt="Dataset Preview Table" />
        <div class="fig-caption">Figure 9: Bates Numbered Metadata Table with Search, Filtering & Record Editor</div>
    </div>
    <p>
        <strong>Description:</strong> Comprehensive paginated data grid displaying generated records with sequential Bates IDs (<code>DS-YYYY-XXXX-0001</code>). Features a 6-column filtering toolbar (text search, document category filter, custodian filter, privilege filter, and responsiveness filter). Clicking "Edit" opens the <code>RecordEditModal</code> to modify record attributes with immediate MongoDB persistence. One-click buttons enable instant CSV and JSON exports.
    </p>

    <!-- PAGE 12: WEB PAGES (ANALYTICS & HISTORY) -->
    <div class="page-break"></div>
    {{PAGE_HEADER}}

    <h3>5. Interactive Analytics & Visualizer Page</h3>
    <div class="fig-container">
        <img src="{{IMG_ANALYTICS}}" class="fig-img" style="max-height: 280px;" alt="Interactive Analytics" />
        <div class="fig-caption">Figure 10: Recharts Interactive Analytics Dashboard</div>
    </div>
    <p>
        <strong>Description:</strong> Renders dynamic chart visualizations computed from backend database aggregations: category bar chart, custodian document distribution, privilege breakdown donut chart, responsiveness donut chart, document creation timeline area chart, and frequency ranking of key issue tags.
    </p>

    <h3>6. Generation History Page</h3>
    <div class="fig-container">
        <img src="{{IMG_HISTORY}}" class="fig-img" style="max-height: 280px;" alt="Generation History" />
        <div class="fig-caption">Figure 11: Generation History and Dataset Management Log</div>
    </div>
    <p>
        <strong>Description:</strong> Detailed log of all historical generation jobs stored in MongoDB. Lists dataset ID, scenario classification, document count, Gemini model used, creation timestamp, validation badge, and quick actions to reload, export to CSV/JSON, or delete datasets.
    </p>

    <!-- PAGE 13: CONCLUSION -->
    <div class="page-break"></div>
    {{PAGE_HEADER}}

    <h2>Conclusion & Academic Significance:</h2>
    <p>
        DiscoSynth AI successfully demonstrates a fully functional, production-grade Generative AI engineering application that addresses a real-world challenge in legal technology: the unavailability of realistic litigation document metadata for benchmarking e-discovery machine learning models.
    </p>
    <p>
        By integrating Google's Gemini 3.8 Flash model via the official Google GenAI Python SDK (<code>google-genai</code>), enforcing strict Pydantic v2 data contracts, and implementing an automated error-repair loop, the platform consistently generates syntactically valid, contextually coherent, and statistically representative metadata records complete with sequential Bates numbering, custodian communication graphs, privilege justifications, and responsiveness classifications.
    </p>
    <p>
        The project rigorously fulfills all academic requirements: combining modern full-stack development (FastAPI backend + React/Vite/Tailwind frontend), persistent database engineering (MongoDB Atlas and local MongoDB with unique indexed collections), prompt engineering with JSON enforcement, and thorough software testing (Pytest suite passing 100%, TypeScript build verification, and live end-to-end execution with zero mocks).
    </p>
    <p>
        <strong>Ethical Boundaries & Scope:</strong> DiscoSynth AI strictly produces synthetic metadata rather than substantive legal text. It does not ingest confidential client documents or replace legal counsel, serving as an uncompromised testing sandbox for data science and e-discovery research.
    </p>
    <p>
        <strong>Future Enhancements:</strong> Potential avenues for future expansion include integrating vector-based custodian clustering (TF-IDF / sentence-transformers), adding multi-lingual legal metadata generation, and implementing automated model evaluation pipelines to benchmark classification accuracy directly inside the platform.
    </p>

</body>
</html>
'''

    # String replacements
    html_content = (
        raw_html
        .replace("{{PAGE_HEADER}}", header_markup)
        .replace("{{IMG_ARCH}}", img_arch)
        .replace("{{IMG_ER}}", img_er)
        .replace("{{IMG_AISTUDIO}}", img_aistudio)
        .replace("{{IMG_TREE}}", img_tree)
        .replace("{{IMG_TERMINAL}}", img_terminal)
        .replace("{{IMG_LANDING}}", img_landing)
        .replace("{{IMG_DASH}}", img_dash)
        .replace("{{IMG_GEN}}", img_gen)
        .replace("{{IMG_PREV}}", img_prev)
        .replace("{{IMG_ANALYTICS}}", img_analytics)
        .replace("{{IMG_HISTORY}}", img_history)
    )

    html_path = "documentation_print.html"
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Generated {html_path} ({len(html_content)} bytes)")

    # Execute Chrome Headless print-to-pdf
    pdf_output = "DiscoSynth_AI_Litigation_Metadata_Generator_Documentation.pdf"
    chrome_bin = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    cmd = [
        chrome_bin,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_output}",
        os.path.abspath(html_path)
    ]
    print("Executing Chrome headless print-to-pdf...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(pdf_output):
        sz = os.path.getsize(pdf_output)
        print(f"SUCCESS: Generated PDF document -> {pdf_output} ({sz} bytes)")
    else:
        print("ERROR:", res.stderr)

if __name__ == "__main__":
    generate_pdf()
