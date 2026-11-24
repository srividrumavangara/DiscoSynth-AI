import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def add_header_logos(doc):
    # Create a 1-row, 2-column table with no borders for the header logos
    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    # Widths: 3.5 in and 3.5 in (total 7 in)
    cell_left = table.cell(0, 0)
    cell_right = table.cell(0, 1)
    cell_left.width = Inches(3.5)
    cell_right.width = Inches(3.5)

    # Remove borders
    for cell in (cell_left, cell_right):
        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(f'''
            <w:tcBorders {nsdecls("w")}>
                <w:top w:val="none"/>
                <w:left w:val="none"/>
                <w:bottom w:val="none"/>
                <w:right w:val="none"/>
            </w:tcBorders>
        ''')
        tcPr.append(borders)

    # Add SmartBridge Logo on Left
    p_left = cell_left.paragraphs[0]
    p_left.alignment = WD_ALIGN_PARAGRAPH.LEFT
    if os.path.exists("docs_assets/header_logo_0_X7.png"):
        p_left.add_run().add_picture("docs_assets/header_logo_0_X7.png", width=Inches(1.8))

    # Add Skill Wallet Logo on Right
    p_right = cell_right.paragraphs[0]
    p_right.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    if os.path.exists("docs_assets/header_logo_1_X10.png"):
        p_right.add_run().add_picture("docs_assets/header_logo_1_X10.png", width=Inches(1.5))

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

def add_code_block(doc, code_text):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    cell.width = Inches(6.8)
    set_cell_background(cell, "1E1E1E") # Dark VS Code editor background
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)

    # Remove borders
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="none"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.05

    for line in code_text.strip().split("\n"):
        run = p.add_run(line + "\n")
        run.font.name = "Courier New"
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(0xD4, 0xD4, 0xD4) # Light gray editor text
        # Simple color heuristics
        if line.strip().startswith("#") or line.strip().startswith("//"):
            run.font.color.rgb = RGBColor(0x6A, 0x99, 0x55) # Green comments
        elif any(line.strip().startswith(kw) for kw in ["def ", "class ", "import ", "from ", "return ", "if ", "elif ", "else:", "try:", "except"]):
            run.font.color.rgb = RGBColor(0x56, 0x9C, 0xD6) # Blue keywords

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

def add_image_with_caption(doc, img_path, caption="", width=Inches(6.2)):
    if os.path.exists(img_path):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(4)
        p.add_run().add_picture(img_path, width=width)
        if caption:
            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_after = Pt(10)
            run_cap = p_cap.add_run(caption)
            run_cap.font.name = "Arial"
            run_cap.font.size = Pt(9.5)
            run_cap.font.italic = True
            run_cap.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

def build_documentation():
    doc = docx.Document()

    # Set page margins to 0.75 in
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # ---------------- PAGE 1 ----------------
    add_header_logos(doc)

    # Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run("DiscoSynth AI: AI-Powered Synthetic Litigation\nMetadata Generator")
    run_title.font.name = "Arial"
    run_title.font.size = Pt(20)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    # Subtitle & Student Names
    p_team = doc.add_paragraph()
    p_team.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_team.paragraph_format.space_after = Pt(16)
    
    r_sub = p_team.add_run("University Academic Capstone Project | Full-Stack Generative AI System\n")
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(11)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)

    r_members = p_team.add_run("Project Team Members:\n")
    r_members.font.name = "Arial"
    r_members.font.size = Pt(11)
    r_members.font.bold = True
    r_members.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    r_names = p_team.add_run("Sri Vidruma Vangara — AP24110010421\nAmrutha Anala — AP24110010985")
    r_names.font.name = "Arial"
    r_names.font.size = Pt(11.5)
    r_names.font.bold = True
    r_names.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    # Project Description
    p_desc_head = doc.add_paragraph()
    p_desc_head.paragraph_format.space_before = Pt(8)
    p_desc_head.paragraph_format.space_after = Pt(4)
    r_dh = p_desc_head.add_run("Project Description:")
    r_dh.font.name = "Arial"
    r_dh.font.size = Pt(13)
    r_dh.font.bold = True

    p_desc = doc.add_paragraph()
    p_desc.paragraph_format.line_spacing = 1.15
    p_desc.paragraph_format.space_after = Pt(10)
    r_d1 = p_desc.add_run(
        "DiscoSynth AI harnesses Generative AI to provide intelligent, structured synthetic litigation document metadata generation, "
        "offering legal technology researchers and data scientists an authentic, statistically robust benchmark creation platform. "
        "In electronic discovery (e-discovery), classification models (such as Technology-Assisted Review / TAR, attorney-client privilege detectors, "
        "and responsiveness classifiers) require diverse datasets to evaluate and calibrate their predictive accuracy. However, actual corporate litigation files "
        "are strictly confidential, subject to attorney-client privilege, work-product doctrine, and data privacy regulations (GDPR, CCPA), making authentic datasets "
        "unavailable for research and academic benchmarking.\n\n"
        "DiscoSynth AI solves this fundamental data availability bottleneck by generating fictional, realistic, and logically consistent litigation metadata "
        "without copying or exposing any confidential real-world legal case records. The platform features an AI-Assisted Natural Language Scenario Interpreter "
        "that parses unstructured factual prompts into structured litigation parameters, a Controlled Batch Generator producing sequential Bates numbering, "
        "fictional custodian communication graphs, privilege justifications, and responsiveness classifications, a multi-tier Pydantic Validation & Automated Repair Loop, "
        "and an interactive Analytics & Visualization dashboard with real-time database aggregations.\n\n"
        "Utilizing Google's official Google GenAI Python SDK (google-genai) interacting with the Gemini 3.8 Flash model (with automated failover protection across "
        "active Gemini Flash models), DiscoSynth AI generates structured JSON metadata conforming strictly to e-discovery production norms. Built with a high-performance "
        "FastAPI backend and a modern React.js (Vite + Tailwind CSS + Recharts) frontend, the platform persists datasets and generation audits into MongoDB Atlas "
        "(with local MongoDB support), enabling seamless filtering, inline record editing, and standard e-discovery CSV and JSON exports."
    )
    r_d1.font.name = "Arial"
    r_d1.font.size = Pt(10)
    r_d1.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    # Scenarios
    p_sc_head = doc.add_paragraph()
    p_sc_head.paragraph_format.space_before = Pt(8)
    p_sc_head.paragraph_format.space_after = Pt(4)
    r_sh = p_sc_head.add_run("Scenarios")
    r_sh.font.name = "Arial"
    r_sh.font.size = Pt(13)
    r_sh.font.bold = True

    scenarios = [
        ("Scenario 1 (Corporate Accounting Fraud): ",
         "A regulatory investigator or legal team specifies a corporate financial fraud investigation concerning unrecorded liabilities, fictitious vendor invoices, and off-balance-sheet debt. "
         "DiscoSynth AI infers the legal scenario, synthesizes key corporate entities ('Titan Global Solutions Inc.', 'Sterling & Croft LLP Outside Counsel', 'Apex Assurance Auditors'), "
         "and generates realistic financial ledgers, email exchanges debating audit findings, board audit committee memoranda, and attorney-client privileged legal risk evaluations, complete with sequential Bates IDs (e.g., DS-2026-BDCD0-0001 through 0010)."),
        
        ("Scenario 2 (Intellectual Property & Trade Secret Theft): ",
         "A patent litigation firm configures a high-stakes trade secret misappropriation dispute where a former VP of Engineering exfiltrated proprietary neural-compression algorithms to a market competitor prior to resigning. "
         "The system synthesizes source code repository commit notices, personal email forwardings, forensic IT departure audit memos, non-disclosure agreements (NDAs), and non-responsive personal communications, calibrating realistic privilege and responsiveness ratios."),
        
        ("Scenario 3 (Employment Discrimination & Retaliation): ",
         "An employment law researcher benchmarks a classifier on internal workplace harassment, unequal compensation, and whistleblower retaliation claims. "
         "DiscoSynth AI generates internal HR investigation reports, encrypted chat logs, performance evaluation sheets, executive committee minutes, and attorney work-product privilege justifications asserting confidentiality in anticipation of litigation.")
    ]

    for title, text in scenarios:
        p_sc = doc.add_paragraph()
        p_sc.paragraph_format.space_after = Pt(8)
        p_sc.paragraph_format.line_spacing = 1.15
        r_st = p_sc.add_run(title)
        r_st.font.name = "Arial"
        r_st.font.size = Pt(10)
        r_st.font.bold = True
        r_st.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
        r_sbody = p_sc.add_run(text)
        r_sbody.font.name = "Arial"
        r_sbody.font.size = Pt(10)
        r_sbody.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    # ---------------- PAGE BREAK -> PAGE 2 ----------------
    doc.add_page_break()
    add_header_logos(doc)

    p_arch_head = doc.add_paragraph()
    p_arch_head.paragraph_format.space_after = Pt(4)
    r_ah = p_arch_head.add_run("Technical Architecture:")
    r_ah.font.name = "Arial"
    r_ah.font.size = Pt(14)
    r_ah.font.bold = True

    add_image_with_caption(doc, "docs_assets/architecture_diagram.png", "Figure 1: DiscoSynth AI Multi-Tier System Architecture", width=Inches(6.5))

    p_arch_desc = doc.add_paragraph()
    p_arch_desc.paragraph_format.line_spacing = 1.15
    p_arch_desc.paragraph_format.space_after = Pt(10)
    r_ad = p_arch_desc.add_run(
        "Description: DiscoSynth AI utilizes a modular, asynchronous three-tier architecture engineered for enterprise legal-tech performance. "
        "The presentation tier provides a responsive Single Page Application (SPA) built with React 18, Vite, Tailwind CSS, Lucide icons, and Recharts for interactive analytics. "
        "The application tier is powered by a high-performance Python FastAPI backend that orchestrates RESTful communication, Pydantic v2 data validation, dynamic prompt engineering, "
        "and automated error-correction loops. It interfaces directly with Google's official Google GenAI Python SDK (google-genai) to invoke Gemini 3.8 Flash with structured JSON enforcement "
        "and resilient multi-model failover. The persistence tier utilizes MongoDB Atlas (and local MongoDB daemon for offline development) storing structured collections for datasets and generation jobs."
    )
    r_ad.font.name = "Arial"
    r_ad.font.size = Pt(10)
    r_ad.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    # Database ER Diagram
    p_er_head = doc.add_paragraph()
    p_er_head.paragraph_format.space_before = Pt(8)
    p_er_head.paragraph_format.space_after = Pt(4)
    r_erh = p_er_head.add_run("Database Entity-Relationship (ER) Diagram & Schema:")
    r_erh.font.name = "Arial"
    r_erh.font.size = Pt(13)
    r_erh.font.bold = True

    p_er_note = doc.add_paragraph()
    r_ern = p_er_note.add_run("(Note: Document database schema and relational references between datasets and generation_jobs collections)")
    r_ern.font.name = "Arial"
    r_ern.font.size = Pt(9.5)
    r_ern.font.italic = True
    r_ern.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)

    add_image_with_caption(doc, "docs_assets/er_diagram.png", "Figure 2: MongoDB Entity-Relationship (ER) Schema Diagram", width=Inches(6.3))

    p_er_desc = doc.add_paragraph()
    p_er_desc.paragraph_format.line_spacing = 1.15
    p_er_desc.paragraph_format.space_after = Pt(10)
    r_erd = p_er_desc.add_run(
        "Database Architecture Description: The persistence tier utilizes MongoDB with two indexed collections:\n"
        "1. datasets Collection: Stores each generated litigation dataset containing dataset_id (unique indexed Bates identifier), dataset name, scenario classification, "
        "factual scenario description, generation configuration (size, complexity, date range, ratios), the full array of validated DocumentMetadata records "
        "(doc_id, title, filename, file_extension, size, timestamps, custodian, author, recipient, privilege_status, privilege_basis, responsiveness, confidentiality, tags, synthetic_marker), "
        "model metadata (model_name, provider, sdk), validation status, and creation timestamps.\n"
        "2. generation_jobs Collection: Acts as an operational audit ledger capturing job_id (unique indexed job identifier), dataset_id (foreign key reference to datasets.dataset_id), "
        "generation status ('completed', 'failed', 'in_progress'), requested vs completed document counts, batch execution progress, total duration in seconds, error logs, and timestamps."
    )
    r_erd.font.name = "Arial"
    r_erd.font.size = Pt(10)
    r_erd.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    # Pre-requisites
    p_pre_head = doc.add_paragraph()
    p_pre_head.paragraph_format.space_before = Pt(8)
    p_pre_head.paragraph_format.space_after = Pt(4)
    r_prh = p_pre_head.add_run("Pre-requisites:")
    r_prh.font.name = "Arial"
    r_prh.font.size = Pt(13)
    r_prh.font.bold = True

    prereqs = [
        "FastAPI Framework Knowledge: https://fastapi.tiangolo.com/",
        "Google GenAI SDK & Gemini API Familiarity: https://ai.google.dev/gemini-api/docs",
        "React.js, TypeScript & Tailwind CSS Skills: https://react.dev/ | https://tailwindcss.com/",
        "MongoDB & PyMongo Database Proficiency: https://www.mongodb.com/docs/",
        "Pydantic v2 Data Modeling & Validation: https://docs.pydantic.dev/",
        "Recharts Data Visualization Library: https://recharts.org/",
        "Version Control with Git & GitHub: https://git-scm.com/doc"
    ]
    for item in prereqs:
        p_item = doc.add_paragraph(style='List Bullet')
        p_item.paragraph_format.space_after = Pt(2)
        r_item = p_item.add_run(item)
        r_item.font.name = "Arial"
        r_item.font.size = Pt(9.5)

    # ---------------- PAGE BREAK -> PAGE 3 ----------------
    doc.add_page_break()
    add_header_logos(doc)

    p_wf_head = doc.add_paragraph()
    p_wf_head.paragraph_format.space_after = Pt(6)
    r_wfh = p_wf_head.add_run("Project Workflow:")
    r_wfh.font.name = "Arial"
    r_wfh.font.size = Pt(14)
    r_wfh.font.bold = True

    milestones_summary = [
        ("Milestone 1: Model Selection and Architecture", [
            "Activity 1.1: Generate a Google Gemini API Key and configure it securely in the backend environment.",
            "Activity 1.2: Research and select the appropriate Generative AI model from Google (Gemini 3.8 Flash with multi-model fallback).",
            "Activity 1.3: Define the architecture of the application, detailing interactions between the React frontend, FastAPI backend, GenAI engine, and MongoDB.",
            "Activity 1.4: Set up the development environment, installing necessary libraries and dependencies for FastAPI, PyMongo, and the Google GenAI SDK."
        ]),
        ("Milestone 2: Core Functionalities Development", [
            "Activity 2.1: Develop the core functionalities: Natural Language Scenario Interpreter, Controlled Batch Metadata Generator, and Pydantic Validation & Repair Engine.",
            "Activity 2.2: Implement the FastAPI backend to manage routing, input schema validation, sequential Bates numbering, and asynchronous job tracking."
        ]),
        ("Milestone 3: Backend API & Service Development", [
            "Activity 3.1: Write the main application logic across modular services (gemini_service.py, prompt_service.py, generation_service.py, validation_service.py, analytics_service.py, export_service.py) establishing endpoints for generation, retrieval, editing, and analytics."
        ]),
        ("Milestone 4: Frontend Development", [
            "Activity 4.1: Design and develop the user interface using React 18, Vite, TypeScript, and Tailwind CSS, creating a modern legal-tech design with Recharts analytics.",
            "Activity 4.2: Implement asynchronous API state management with Axios, connecting the frontend to FastAPI endpoints for scenario parsing, dataset generation, inline record editing, and CSV/JSON exports."
        ]),
        ("Milestone 5: Deployment, Testing & Verification", [
            "Activity 5.1: Prepare the application for local deployment by configuring the MongoDB daemon, virtual environment, and startup scripts (start_backend.sh and start_frontend.sh).",
            "Activity 5.2: Execute comprehensive verification: run the backend Pytest suite (9 tests passing), build the production frontend bundle, and run live end-to-end generation verifying all 8 steps without mocks.",
            "Activity 5.3: Deploy and publish the project to GitHub repository (https://github.com/srividrumavangara/DiscoSynth-AI) with production deployment configurations for Render, Vercel, and MongoDB Atlas."
        ]),
        ("Milestone 6: Conclusion", [
            "Summarize the technical and academic achievements of DiscoSynth AI, evaluate e-discovery model benchmarking impact, address ethical boundaries, and outline future enhancements."
        ])
    ]

    for m_title, activities in milestones_summary:
        p_m = doc.add_paragraph()
        p_m.paragraph_format.space_before = Pt(8)
        p_m.paragraph_format.space_after = Pt(2)
        r_mt = p_m.add_run(m_title)
        r_mt.font.name = "Arial"
        r_mt.font.size = Pt(11.5)
        r_mt.font.bold = True
        r_mt.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

        for act in activities:
            p_act = doc.add_paragraph(style='List Bullet')
            p_act.paragraph_format.space_after = Pt(2)
            r_act = p_act.add_run(act)
            r_act.font.name = "Arial"
            r_act.font.size = Pt(9.5)
            r_act.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    # ---------------- PAGE BREAK -> PAGE 4: MILESTONE 1 ----------------
    doc.add_page_break()
    add_header_logos(doc)

    p_m1_head = doc.add_paragraph()
    r_m1h = p_m1_head.add_run("Milestone 1: Model Selection and Architecture")
    r_m1h.font.name = "Arial"
    r_m1h.font.size = Pt(15)
    r_m1h.font.bold = True

    p_m1_desc = doc.add_paragraph()
    p_m1_desc.paragraph_format.line_spacing = 1.15
    p_m1_desc.paragraph_format.space_after = Pt(8)
    r_m1d = p_m1_desc.add_run(
        "In this milestone, we focus on selecting the appropriate Generative AI model from Google for our synthetic litigation metadata generation needs. "
        "This involves researching the capabilities, context windows, and structured JSON output performance of Google's latest models, "
        "ensuring that the chosen model aligns with the rigorous demands of e-discovery document metadata (Bates IDs, custodians, privilege, responsiveness, and issue tags)."
    )
    r_m1d.font.name = "Arial"
    r_m1d.font.size = Pt(10)

    # Activity 1.1
    p_a11_head = doc.add_paragraph()
    p_a11_head.paragraph_format.space_before = Pt(6)
    p_a11_head.paragraph_format.space_after = Pt(4)
    r_a11h = p_a11_head.add_run("Activity 1.1: Generate a Google Gemini API Key")
    r_a11h.font.name = "Arial"
    r_a11h.font.size = Pt(13)
    r_a11h.font.bold = True

    p_a11_steps = doc.add_paragraph()
    p_a11_steps.paragraph_format.line_spacing = 1.15
    r_a11s = p_a11_steps.add_run(
        "Before the application can communicate with the Gemini LLM, you need a valid Google Gemini API key. Follow the steps below to create one and connect it securely to the project:\n"
        "• Step 1 — Create a Google AI Studio Account: Visit https://aistudio.google.com and sign in using your Google account.\n"
        "• Step 2 — Navigate to Get API Key: Click on 'Get API key' from the left sidebar navigation menu.\n"
        "• Step 3 — Create a New API Key: Click the '+ Create API key' button. Select an existing Google Cloud Project or click 'Create API key in new project'.\n"
        "• Step 4 — Secure Your API Key: Copy the generated API key string immediately and store it securely."
    )
    r_a11s.font.name = "Arial"
    r_a11s.font.size = Pt(10)

    add_image_with_caption(doc, "docs_assets/gemini_aistudio.png", "Figure 3: Google AI Studio API Key Management Console", width=Inches(6.0))

    p_a11_conf = doc.add_paragraph()
    p_a11_conf.paragraph_format.line_spacing = 1.15
    p_a11_conf.paragraph_format.space_after = Pt(4)
    r_a11c = p_a11_conf.add_run(
        "• Step 5 — Add the Key to Your Project: Create a .env file inside the backend directory (backend/.env) and configure the API key and model parameters as shown below:"
    )
    r_a11c.font.name = "Arial"
    r_a11c.font.size = Pt(10)

    add_code_block(doc, 
        "# backend/.env\n"
        "GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxAkQ\n"
        "GEMINI_MODEL=gemini-3.8-flash\n"
        "MONGODB_URI=mongodb://localhost:27017\n"
        "DATABASE_NAME=discosynth_ai\n"
        "PORT=8000\n"
        "ENVIRONMENT=development"
    )

    p_a11_ver = doc.add_paragraph()
    p_a11_ver.paragraph_format.line_spacing = 1.15
    p_a11_ver.paragraph_format.space_after = Pt(4)
    r_a11v = p_a11_ver.add_run(
        "• Step 6 — Verify Key Loading via Pydantic Settings:\n"
        "The application loads the key securely at backend startup using pydantic-settings in backend/app/config.py. The key is never exposed to the client or browser."
    )
    r_a11v.font.name = "Arial"
    r_a11v.font.size = Pt(10)

    add_code_block(doc,
        "# backend/app/config.py\n"
        "from pydantic_settings import BaseSettings, SettingsConfigDict\n\n"
        "class Settings(BaseSettings):\n"
        "    GEMINI_API_KEY: str\n"
        "    GEMINI_MODEL: str = 'gemini-3.8-flash'\n"
        "    MONGODB_URI: str = 'mongodb://localhost:27017'\n"
        "    DATABASE_NAME: str = 'discosynth_ai'\n"
        "    model_config = SettingsConfigDict(env_file='.env', extra='ignore')\n\n"
        "settings = Settings()"
    )

    p_a11_git = doc.add_paragraph()
    p_a11_git.paragraph_format.space_after = Pt(8)
    r_a11g = p_a11_git.add_run(
        "• Important — Never Commit Your API Key: The project's root .gitignore file strictly excludes backend/.env, preventing any accidental credential leakage to public repositories."
    )
    r_a11g.font.name = "Arial"
    r_a11g.font.size = Pt(9.5)
    r_a11g.font.bold = True
    r_a11g.font.color.rgb = RGBColor(0xDC, 0x26, 0x26)

    # ---------------- PAGE BREAK -> PAGE 5: ACTIVITIES 1.2, 1.3, 1.4 ----------------
    doc.add_page_break()
    add_header_logos(doc)

    # Activity 1.2
    p_a12_head = doc.add_paragraph()
    r_a12h = p_a12_head.add_run("Activity 1.2: Research and Select the Appropriate Generative AI Model")
    r_a12h.font.name = "Arial"
    r_a12h.font.size = Pt(13)
    r_a12h.font.bold = True

    p_a12_desc = doc.add_paragraph()
    p_a12_desc.paragraph_format.line_spacing = 1.15
    p_a12_desc.paragraph_format.space_after = Pt(8)
    r_a12d = p_a12_desc.add_run(
        "Here are the core criteria and engineering evaluations conducted to select the optimal model for DiscoSynth AI:\n"
        "• Model Deprecation Migration: During testing, Google officially deprecated gemini-2.5-flash for new users (returning HTTP 404), "
        "explicitly recommending migration to gemini-3.8-flash and the official google-genai Python SDK.\n"
        "• Evaluate Model Performance: Gemini 3.8 Flash delivers sub-second token generation latency, a 1-million-token context window, "
        "and superior JSON schema instruction following compared to legacy models.\n"
        "• Resilient Multi-Model Fallback Queue: To prevent application downtime during Google's demand surges (HTTP 503) or rate limits (HTTP 429), "
        "we engineered an automated fallback queue in GeminiService: gemini-3.8-flash -> gemini-3.5-flash -> gemini-3.1-flash-lite. "
        "This ensures generation requests succeed reliably while recording the exact model used in the dataset metadata.\n"
        "• SDK Selection: Migrated from legacy google-generativeai to the official Google GenAI Python SDK (google-genai) configured with "
        "types.HttpOptions(timeout=30000) and response_mime_type='application/json'."
    )
    r_a12d.font.name = "Arial"
    r_a12d.font.size = Pt(10)

    # Activity 1.3
    p_a13_head = doc.add_paragraph()
    p_a13_head.paragraph_format.space_before = Pt(6)
    p_a13_head.paragraph_format.space_after = Pt(4)
    r_a13h = p_a13_head.add_run("Activity 1.3: Define the Architecture of the Application")
    r_a13h.font.name = "Arial"
    r_a13h.font.size = Pt(13)
    r_a13h.font.bold = True

    p_a13_desc = doc.add_paragraph()
    p_a13_desc.paragraph_format.line_spacing = 1.15
    p_a13_desc.paragraph_format.space_after = Pt(8)
    r_a13d = p_a13_desc.add_run(
        "• Client-Side Responsibilities: React frontend captures scenario parameters, custodians, date spans, and privilege ratios; renders interactive "
        "Recharts visualizations (bar, donut, and area charts); supports 6-column tabular filtering; and provides modal inline editing for document records.\n"
        "• Backend Responsibilities: FastAPI coordinates validation of incoming payloads via Pydantic schemas, builds context-aware prompts in PromptService, "
        "manages controlled batch splitting (up to 25 documents per batch) in GenerationService, and computes analytical distributions in AnalyticsService.\n"
        "• AI Integration Points: GeminiService connects via Google GenAI Client with temperature=0.3 for high structural fidelity, enforces strict JSON schema "
        "output, and executes an automated repair loop (max 2 attempts) if records fail Pydantic validation checks."
    )
    r_a13d.font.name = "Arial"
    r_a13d.font.size = Pt(10)

    # Activity 1.4
    p_a14_head = doc.add_paragraph()
    p_a14_head.paragraph_format.space_before = Pt(6)
    p_a14_head.paragraph_format.space_after = Pt(4)
    r_a14h = p_a14_head.add_run("Activity 1.4: Set Up the Development Environment")
    r_a14h.font.name = "Arial"
    r_a14h.font.size = Pt(13)
    r_a14h.font.bold = True

    p_a14_desc = doc.add_paragraph()
    p_a14_desc.paragraph_format.line_spacing = 1.15
    p_a14_desc.paragraph_format.space_after = Pt(4)
    r_a14d = p_a14_desc.add_run(
        "• Python Virtual Environment & Dependencies: Initialize a dedicated virtual environment and install backend requirements:\n"
        "  $ cd backend && python3 -m venv venv && source venv/bin/activate\n"
        "  $ pip install -r requirements.txt (fastapi, uvicorn, pydantic, pymongo, google-genai, pandas, pytest)\n"
        "• Frontend Node Environment: Initialize and verify frontend dependencies:\n"
        "  $ cd frontend && npm install (react, vite, tailwindcss, recharts, lucide-react, axios)\n"
        "• Application Directory Structure: Structured as a clean monorepo separating frontend, backend, local MongoDB data, and automated scripts:"
    )
    r_a14d.font.name = "Arial"
    r_a14d.font.size = Pt(10)

    add_image_with_caption(doc, "docs_assets/vscode_project_tree.png", "Figure 4: DiscoSynth AI Project Directory Structure in VS Code", width=Inches(5.8))

    # ---------------- PAGE BREAK -> PAGE 6: MILESTONE 2 ----------------
    doc.add_page_break()
    add_header_logos(doc)

    p_m2_head = doc.add_paragraph()
    r_m2h = p_m2_head.add_run("Milestone 2: Core Functionalities Development")
    r_m2h.font.name = "Arial"
    r_m2h.font.size = Pt(15)
    r_m2h.font.bold = True

    # Activity 2.1
    p_a21_head = doc.add_paragraph()
    p_a21_head.paragraph_format.space_before = Pt(6)
    p_a21_head.paragraph_format.space_after = Pt(4)
    r_a21h = p_a21_head.add_run("Activity 2.1: Develop Core Metadata Generation Features")
    r_a21h.font.name = "Arial"
    r_a21h.font.size = Pt(13)
    r_a21h.font.bold = True

    p_a21_desc = doc.add_paragraph()
    p_a21_desc.paragraph_format.line_spacing = 1.15
    p_a21_desc.paragraph_format.space_after = Pt(8)
    r_a21d = p_a21_desc.add_run(
        "Implement the three primary Generative AI generation modules driving DiscoSynth AI:\n"
        "• Module 1 — Natural Language Scenario Interpreter: Evaluates unstructured litigation briefs, news summaries, or case outlines. "
        "Gemini infers formal case metadata: inferred litigation category (Corporate Fraud, Intellectual Property, Employment, Contract, etc.), "
        "formal case caption, roster of 4–6 key corporate and legal entities, and 3–5 core legal issues/claims.\n"
        "• Module 2 — Controlled Batch Metadata Generator: Generates realistic e-discovery metadata in controlled batches of up to 25 records. "
        "Enforces sequential Bates numbering (e.g., DS-2026-BDCD0-0001), custodian email communication graphs, realistic timestamps, "
        "document types (Emails, Financial Records, Internal Communications, Contracts, Reports), privilege classifications (Attorney-Client, Work Product, Not Privileged) "
        "with required legal basis rationale, confidentiality markings, and responsiveness classifications.\n"
        "• Module 3 — Validation & Automated Repair Engine: Validates every record against Pydantic schemas and semantic rules (date ranges, category whitelist, "
        "privilege justification required for privileged documents). If invalid records occur, PromptService generates a targeted repair prompt for Gemini."
    )
    r_a21d.font.name = "Arial"
    r_a21d.font.size = Pt(10)

    # Activity 2.2
    p_a22_head = doc.add_paragraph()
    p_a22_head.paragraph_format.space_before = Pt(6)
    p_a22_head.paragraph_format.space_after = Pt(4)
    r_a22h = p_a22_head.add_run("Activity 2.2: Implement the FastAPI Backend & Routing")
    r_a22h.font.name = "Arial"
    r_a22h.font.size = Pt(13)
    r_a22h.font.bold = True

    p_a22_desc = doc.add_paragraph()
    p_a22_desc.paragraph_format.line_spacing = 1.15
    p_a22_desc.paragraph_format.space_after = Pt(8)
    r_a22d = p_a22_desc.add_run(
        "Define REST API Endpoints in FastAPI:\n"
        "• POST /api/scenario/interpret: Accepts natural-language text and returns inferred scenario parameters and entity rosters.\n"
        "• POST /api/generation/generate: Orchestrates batch generation, Pydantic validation, repair loops, and database persistence into datasets and generation_jobs.\n"
        "• GET /api/datasets: Retrieves paginated dataset summaries from MongoDB for the history and dashboard views.\n"
        "• GET /api/datasets/{dataset_id}: Retrieves complete dataset details including all generated document metadata records.\n"
        "• PATCH /api/datasets/{dataset_id}/records/{doc_id}: Enables inline editing of specific metadata records with MongoDB persistence.\n"
        "• GET /api/analytics/{dataset_id}: Computes real-time aggregation distributions across categories, custodians, privilege, and responsiveness.\n"
        "• GET /api/datasets/{dataset_id}/export/csv and /json: Streams high-fidelity e-discovery CSV and JSON exports for classification benchmarking."
    )
    r_a22d.font.name = "Arial"
    r_a22d.font.size = Pt(10)

    # ---------------- PAGE BREAK -> PAGE 7: MILESTONE 3 ----------------
    doc.add_page_break()
    add_header_logos(doc)

    p_m3_head = doc.add_paragraph()
    r_m3h = p_m3_head.add_run("Milestone 3: Backend Application Logic & Services")
    r_m3h.font.name = "Arial"
    r_m3h.font.size = Pt(15)
    r_m3h.font.bold = True

    p_m3_desc = doc.add_paragraph()
    p_m3_desc.paragraph_format.line_spacing = 1.15
    p_m3_desc.paragraph_format.space_after = Pt(6)
    r_m3d = p_m3_desc.add_run(
        "Activity 3.1: Writing Core Application Logic in Backend Services\n"
        "Milestone 3 focuses on implementing modular backend services and API route handlers that power the Generative AI workflow, "
        "Pydantic validation, and MongoDB interactions."
    )
    r_m3d.font.name = "Arial"
    r_m3d.font.size = Pt(10)

    # Code Snippet 1: Generation Route
    p_cs1_head = doc.add_paragraph()
    r_cs1h = p_cs1_head.add_run("1. Generation Route Handler (backend/app/routes/generation.py):")
    r_cs1h.font.name = "Arial"
    r_cs1h.font.size = Pt(11)
    r_cs1h.font.bold = True

    add_code_block(doc,
        "@router.post('/generate', response_model=DatasetDetail)\n"
        "async def generate_dataset(config: GenerationConfig):\n"
        "    try:\n"
        "        # Calls controlled batch generator with Gemini 3.8 Flash & Pydantic validation\n"
        "        dataset = await generation_service.generate_dataset(config)\n"
        "        return dataset\n"
        "    except Exception as e:\n"
        "        logger.error(f'Dataset generation failed: {e}')\n"
        "        raise HTTPException(status_code=500, detail=str(e))"
    )

    # Code Snippet 2: Gemini Service
    p_cs2_head = doc.add_paragraph()
    r_cs2h = p_cs2_head.add_run("2. Google GenAI Client & Resilient Invocations (backend/app/services/gemini_service.py):")
    r_cs2h.font.name = "Arial"
    r_cs2h.font.size = Pt(11)
    r_cs2h.font.bold = True

    add_code_block(doc,
        "class GeminiService:\n"
        "    FALLBACK_MODELS = ['gemini-3.5-flash', 'gemini-3.1-flash-lite']\n\n"
        "    def __init__(self):\n"
        "        from google import genai\n"
        "        from google.genai import types\n"
        "        self._client = genai.Client(\n"
        "            api_key=settings.GEMINI_API_KEY,\n"
        "            http_options=types.HttpOptions(timeout=30000)\n"
        "        )\n\n"
        "    def _call_with_resilience(self, prompt: str, system_instruction: str = None):\n"
        "        for model_candidate in [self.model_name] + self.FALLBACK_MODELS:\n"
        "            try:\n"
        "                config = types.GenerateContentConfig(\n"
        "                    response_mime_type='application/json',\n"
        "                    temperature=0.3\n"
        "                )\n"
        "                response = self._client.models.generate_content(\n"
        "                    model=model_candidate, contents=prompt, config=config\n"
        "                )\n"
        "                return response.text, model_candidate\n"
        "            except Exception as e:\n"
        "                if '503' in str(e) or '429' in str(e):\n"
        "                    continue  # Failover seamlessly to active fallback model\n"
        "                raise e"
    )

    # Code Snippet 3: Prompt Service
    p_cs3_head = doc.add_paragraph()
    r_cs3h = p_cs3_head.add_run("3. E-Discovery Prompt Engineering & JSON Formatting (backend/app/services/prompt_service.py):")
    r_cs3h.font.name = "Arial"
    r_cs3h.font.size = Pt(11)
    r_cs3h.font.bold = True

    add_code_block(doc,
        "def build_batch_prompt(config: GenerationConfig, batch_num: int, batch_size: int, context: dict) -> str:\n"
        "    return f'''\n"
        "Generate exactly {batch_size} realistic synthetic litigation metadata records in valid JSON.\n"
        "Scenario: {config.scenario_type} - {config.scenario_description}\n"
        "Bates ID Range: {context['bates_prefix']}-{context['start_seq']:04d} onwards.\n"
        "Custodians available: {', '.join(context['custodians'])}\n"
        "Privilege Target Ratio: {config.privilege_ratio:.0%}\n\n"
        "Respond with a JSON object: {{\"records\": [ {{ ...DocumentMetadata fields... }} ] }}\n"
        "Every record MUST include synthetic_marker: 'SYNTHETIC_EVAL_RECORD'.\n"
        "'''"
    )

    # Code Snippet 4: Pydantic Schema
    p_cs4_head = doc.add_paragraph()
    r_cs4h = p_cs4_head.add_run("4. Pydantic v2 Document Metadata Schema (backend/app/schemas/metadata_record.py):")
    r_cs4h.font.name = "Arial"
    r_cs4h.font.size = Pt(11)
    r_cs4h.font.bold = True

    add_code_block(doc,
        "class DocumentMetadata(BaseModel):\n"
        "    doc_id: str = Field(description='Sequential Bates ID')\n"
        "    filename: str\n"
        "    title: str\n"
        "    doc_type: str = Field(description='Email, Financial Records, Internal Communications, etc.')\n"
        "    file_extension: str\n"
        "    file_size_kb: int\n"
        "    creation_date: str\n"
        "    modified_date: str\n"
        "    custodian: str\n"
        "    author: str\n"
        "    recipient: Optional[str] = None\n"
        "    privilege_status: str = Field(description='Attorney-Client, Work Product, Not Privileged')\n"
        "    privilege_basis: Optional[str] = None\n"
        "    responsiveness: str = Field(description='Responsive, Non-Responsive')\n"
        "    confidentiality: str\n"
        "    issue_tags: List[str] = []\n"
        "    synthetic_marker: str = 'SYNTHETIC_EVAL_RECORD'"
    )

    # ---------------- PAGE BREAK -> PAGE 8: MILESTONE 4 ----------------
    doc.add_page_break()
    add_header_logos(doc)

    p_m4_head = doc.add_paragraph()
    r_m4h = p_m4_head.add_run("Milestone 4: Frontend Development")
    r_m4h.font.name = "Arial"
    r_m4h.font.size = Pt(15)
    r_m4h.font.bold = True

    # Activity 4.1
    p_a41_head = doc.add_paragraph()
    p_a41_head.paragraph_format.space_before = Pt(6)
    p_a41_head.paragraph_format.space_after = Pt(4)
    r_a41h = p_a41_head.add_run("Activity 4.1: Designing and Developing the User Interface")
    r_a41h.font.name = "Arial"
    r_a41h.font.size = Pt(13)
    r_a41h.font.bold = True

    p_a41_desc = doc.add_paragraph()
    p_a41_desc.paragraph_format.line_spacing = 1.15
    p_a41_desc.paragraph_format.space_after = Pt(8)
    r_a41d = p_a41_desc.add_run(
        "Milestone 4 focuses on creating an intuitive, highly functional user interface for legal researchers and data scientists. "
        "Built with React 18, Vite, and Tailwind CSS, the UI follows a modern dark legal-tech aesthetic (slate-950 background, blue/indigo accent highlights, and crisp borders):\n"
        "• Navigation & System Status Bar: Displays real-time database connectivity (MongoDB Connected) and active Gemini model status badge (gemini-3.8-flash).\n"
        "• Landing Page: Introduces the core e-discovery problem statement, EDRM workflow diagram, and direct navigation to generation tools.\n"
        "• Interactive Dashboard: Aggregates real stored metrics from MongoDB—total datasets, total documents, privileged ratios, and recent generation logs.\n"
        "• Generator Form & NL Scenario Modal: Allows parameter tuning (size 10–100, complexity, date ranges, custodian lists) and provides an AI Scenario Interpreter modal with one-click corporate fraud and IP theft presets.\n"
        "• Dataset Preview Table: Multi-column searchable grid with Bates IDs, custodians, file types, privilege badges, and inline record edit modal.\n"
        "• Analytics Visualizer: Recharts-powered dashboard rendering category bar charts, custodian distribution, privilege donut, responsiveness donut, and timeline area charts."
    )
    r_a41d.font.name = "Arial"
    r_a41d.font.size = Pt(10)

    # Activity 4.2
    p_a42_head = doc.add_paragraph()
    p_a42_head.paragraph_format.space_before = Pt(6)
    p_a42_head.paragraph_format.space_after = Pt(4)
    r_a42h = p_a42_head.add_run("Activity 4.2: Asynchronous State Management & API Integration")
    r_a42h.font.name = "Arial"
    r_a42h.font.size = Pt(13)
    r_a42h.font.bold = True

    p_a42_desc = doc.add_paragraph()
    p_a42_desc.paragraph_format.line_spacing = 1.15
    p_a42_desc.paragraph_format.space_after = Pt(8)
    r_a42d = p_a42_desc.add_run(
        "• Axios API Client (frontend/src/api/client.ts): Encapsulates all backend REST endpoints with strict TypeScript typings and automatic error handling.\n"
        "• Asynchronous Generation Handling: When the user submits a generation request, the UI displays animated step spinners ('Analyzing scenario...', 'Calling Gemini 3.8 Flash...', 'Validating schemas...').\n"
        "• Inline Record Editing & Persistence: Editing a record in RecordEditModal sends a PATCH request to /api/datasets/{id}/records/{doc_id}, immediately updating the MongoDB document and refreshing the preview table.\n"
        "• Streamed File Exports: One-click CSV and JSON download triggers stream the exported files directly from the FastAPI backend to the user's browser."
    )
    r_a42d.font.name = "Arial"
    r_a42d.font.size = Pt(10)

    # ---------------- PAGE BREAK -> PAGE 9: MILESTONE 5 ----------------
    doc.add_page_break()
    add_header_logos(doc)

    p_m5_head = doc.add_paragraph()
    r_m5h = p_m5_head.add_run("Milestone 5: Deployment, Testing & Verification")
    r_m5h.font.name = "Arial"
    r_m5h.font.size = Pt(15)
    r_m5h.font.bold = True

    # Activity 5.1
    p_a51_head = doc.add_paragraph()
    p_a51_head.paragraph_format.space_before = Pt(6)
    p_a51_head.paragraph_format.space_after = Pt(4)
    r_a51h = p_a51_head.add_run("Activity 5.1: Preparing the Application for Local Deployment")
    r_a51h.font.name = "Arial"
    r_a51h.font.size = Pt(13)
    r_a51h.font.bold = True

    p_a51_desc = doc.add_paragraph()
    p_a51_desc.paragraph_format.line_spacing = 1.15
    p_a51_desc.paragraph_format.space_after = Pt(4)
    r_a51d = p_a51_desc.add_run(
        "To run DiscoSynth AI locally, execute the provided startup scripts or launch each service in separate terminal sessions:\n"
        "• Terminal 1 — Start MongoDB Daemon & FastAPI Backend:\n"
        "  $ ./start_backend.sh (or mongod --dbpath ./mongodb_data --port 27017 && uvicorn app.main:app --port 8000)\n"
        "• Terminal 2 — Start Vite React Frontend:\n"
        "  $ ./start_frontend.sh (or cd frontend && npm run dev -- --port 5173)\n"
        "• System Health Verification: Access http://localhost:8000/api/health to confirm MongoDB and Gemini status."
    )
    r_a51d.font.name = "Arial"
    r_a51d.font.size = Pt(10)

    # Activity 5.2
    p_a52_head = doc.add_paragraph()
    p_a52_head.paragraph_format.space_before = Pt(6)
    p_a52_head.paragraph_format.space_after = Pt(4)
    r_a52h = p_a52_head.add_run("Activity 5.2: Local Testing, Pytest Suite & E2E Verification")
    r_a52h.font.name = "Arial"
    r_a52h.font.size = Pt(13)
    r_a52h.font.bold = True

    p_a52_desc = doc.add_paragraph()
    p_a52_desc.paragraph_format.line_spacing = 1.15
    p_a52_desc.paragraph_format.space_after = Pt(4)
    r_a52d = p_a52_desc.add_run(
        "Comprehensive testing was conducted on live backend and database infrastructure without mocks:\n"
        "• Backend Pytest Suite: All 9 unit and integration tests passed in 1.12 seconds verifying health probes, Gemini connectivity, Pydantic constraints, and date validations.\n"
        "• Frontend Production Build: npm run build completed cleanly in 3.79 seconds with 0 TypeScript compiler errors.\n"
        "• Live End-to-End Verification (verify_e2e.py): Successfully executed all 8 pipeline steps with 100% success:"
    )
    r_a52d.font.name = "Arial"
    r_a52d.font.size = Pt(10)

    add_image_with_caption(doc, "docs_assets/terminal_verification.png", "Figure 5: Pytest Suite and Complete Live End-to-End Verification Terminal", width=Inches(6.2))

    # Activity 5.3
    p_a53_head = doc.add_paragraph()
    p_a53_head.paragraph_format.space_before = Pt(6)
    p_a53_head.paragraph_format.space_after = Pt(4)
    r_a53h = p_a53_head.add_run("Activity 5.3: Version Control & GitHub Repository")
    r_a53h.font.name = "Arial"
    r_a53h.font.size = Pt(13)
    r_a53h.font.bold = True

    p_a53_desc = doc.add_paragraph()
    p_a53_desc.paragraph_format.line_spacing = 1.15
    p_a53_desc.paragraph_format.space_after = Pt(6)
    r_a53d = p_a53_desc.add_run(
        "The entire codebase has been committed and deployed to the GitHub repository under the user's account:\n"
        "• Repository URL: https://github.com/srividrumavangara/DiscoSynth-AI\n"
        "• Security Measures: .gitignore ensures backend/.env and API keys are never exposed.\n"
        "• Cloud Production Deployment:\n"
        "  - Backend: Deployable to Render or AWS as a Python 3 Web Service bound to MongoDB Atlas.\n"
        "  - Frontend: Deployable to Vercel or Netlify with VITE_API_URL pointing to the production backend.\n"
        "  - Database: Connect to MongoDB Atlas cluster by updating MONGODB_URI in environment variables."
    )
    r_a53d.font.name = "Arial"
    r_a53d.font.size = Pt(10)

    # ---------------- PAGE BREAK -> PAGE 10: WEB PAGES ----------------
    doc.add_page_break()
    add_header_logos(doc)

    p_web_head = doc.add_paragraph()
    r_webh = p_web_head.add_run("Exploring the Website's Web Pages:")
    r_webh.font.name = "Arial"
    r_webh.font.size = Pt(15)
    r_webh.font.bold = True

    # 1. Landing Page
    p_wp1 = doc.add_paragraph()
    p_wp1.paragraph_format.space_before = Pt(6)
    p_wp1.paragraph_format.space_after = Pt(2)
    r_wp1 = p_wp1.add_run("1. Landing Page (Home):")
    r_wp1.font.name = "Arial"
    r_wp1.font.size = Pt(12)
    r_wp1.font.bold = True

    add_image_with_caption(doc, "docs_assets/screenshot_landing.png", "Figure 6: DiscoSynth AI Landing Page & EDRM Workflow Explainer", width=Inches(6.0))

    p_wp1_d = doc.add_paragraph()
    p_wp1_d.paragraph_format.line_spacing = 1.15
    p_wp1_d.paragraph_format.space_after = Pt(10)
    r_wp1d = p_wp1_d.add_run(
        "Description: Introduces DiscoSynth AI with a legal-tech SaaS hero section, an explainer of the e-discovery data availability bottleneck, "
        "interactive architecture badges, and an EDRM (Electronic Discovery Reference Model) pipeline guide with a direct 'Start Generating' CTA button."
    )
    r_wp1d.font.name = "Arial"
    r_wp1d.font.size = Pt(9.5)

    # 2. Dashboard Page
    p_wp2 = doc.add_paragraph()
    p_wp2.paragraph_format.space_before = Pt(6)
    p_wp2.paragraph_format.space_after = Pt(2)
    r_wp2 = p_wp2.add_run("2. Interactive Dashboard Page:")
    r_wp2.font.name = "Arial"
    r_wp2.font.size = Pt(12)
    r_wp2.font.bold = True

    add_image_with_caption(doc, "docs_assets/screenshot_dashboard.png", "Figure 7: Live Application Dashboard with Real MongoDB Statistics", width=Inches(6.0))

    p_wp2_d = doc.add_paragraph()
    p_wp2_d.paragraph_format.line_spacing = 1.15
    p_wp2_d.paragraph_format.space_after = Pt(10)
    r_wp2d = p_wp2_d.add_run(
        "Description: Real-time operational dashboard displaying live metrics aggregated from MongoDB: total datasets generated, "
        "total synthetic documents, active litigation scenario count, privilege vs non-privileged document ratio, and responsiveness distribution. "
        "Includes a system health indicator card verifying active Gemini model and MongoDB connectivity."
    )
    r_wp2d.font.name = "Arial"
    r_wp2d.font.size = Pt(9.5)

    # ---------------- PAGE BREAK -> PAGE 11: GENERATOR & PREVIEW ----------------
    doc.add_page_break()
    add_header_logos(doc)

    # 3. Generator Page
    p_wp3 = doc.add_paragraph()
    p_wp3.paragraph_format.space_after = Pt(2)
    r_wp3 = p_wp3.add_run("3. Synthetic Dataset Generator & NL Scenario Modal:")
    r_wp3.font.name = "Arial"
    r_wp3.font.size = Pt(12)
    r_wp3.font.bold = True

    add_image_with_caption(doc, "docs_assets/screenshot_generator.png", "Figure 8: Synthetic Dataset Parameter Generator Form", width=Inches(6.0))

    p_wp3_d = doc.add_paragraph()
    p_wp3_d.paragraph_format.line_spacing = 1.15
    p_wp3_d.paragraph_format.space_after = Pt(10)
    r_wp3d = p_wp3_d.add_run(
        "Description: The primary generation control center. Allows users to select litigation scenarios (Corporate Fraud, IP Theft, Employment, etc.), "
        "configure dataset size (10, 25, 50, 100), adjust complexity levels, define date spans, set custom custodians, and adjust target privilege ratios. "
        "Features the 'AI Assist: Interpret Scenario' modal button that invokes Gemini to automatically parse case narratives into parameter sets."
    )
    r_wp3d.font.name = "Arial"
    r_wp3d.font.size = Pt(9.5)

    # 4. Preview Table
    p_wp4 = doc.add_paragraph()
    p_wp4.paragraph_format.space_before = Pt(6)
    p_wp4.paragraph_format.space_after = Pt(2)
    r_wp4 = p_wp4.add_run("4. Bates Dataset Preview Table & Inline Record Editor:")
    r_wp4.font.name = "Arial"
    r_wp4.font.size = Pt(12)
    r_wp4.font.bold = True

    add_image_with_caption(doc, "docs_assets/screenshot_preview.png", "Figure 9: Bates Numbered Metadata Table with Search, Filtering & Record Editor", width=Inches(6.0))

    p_wp4_d = doc.add_paragraph()
    p_wp4_d.paragraph_format.line_spacing = 1.15
    p_wp4_d.paragraph_format.space_after = Pt(10)
    r_wp4d = p_wp4_d.add_run(
        "Description: Comprehensive paginated data grid displaying generated records with sequential Bates IDs (DS-YYYY-XXXX-0001). "
        "Features a 6-column filtering toolbar (text search, document category filter, custodian filter, privilege filter, and responsiveness filter). "
        "Clicking 'Edit' opens the RecordEditModal to modify record attributes with immediate MongoDB persistence. One-click buttons enable instant CSV and JSON exports."
    )
    r_wp4d.font.name = "Arial"
    r_wp4d.font.size = Pt(9.5)

    # ---------------- PAGE BREAK -> PAGE 12: ANALYTICS, HISTORY, CONCLUSION ----------------
    doc.add_page_break()
    add_header_logos(doc)

    # 5. Analytics Page
    p_wp5 = doc.add_paragraph()
    p_wp5.paragraph_format.space_after = Pt(2)
    r_wp5 = p_wp5.add_run("5. Interactive Analytics & Visualizer Page:")
    r_wp5.font.name = "Arial"
    r_wp5.font.size = Pt(12)
    r_wp5.font.bold = True

    add_image_with_caption(doc, "docs_assets/screenshot_analytics.png", "Figure 10: Recharts Interactive Analytics Dashboard", width=Inches(6.0))

    p_wp5_d = doc.add_paragraph()
    p_wp5_d.paragraph_format.line_spacing = 1.15
    p_wp5_d.paragraph_format.space_after = Pt(10)
    r_wp5d = p_wp5_d.add_run(
        "Description: Renders dynamic chart visualizations computed from backend database aggregations: category bar chart, custodian document distribution, "
        "privilege breakdown donut chart, responsiveness donut chart, document creation timeline area chart, and frequency ranking of key issue tags."
    )
    r_wp5d.font.name = "Arial"
    r_wp5d.font.size = Pt(9.5)

    # 6. History Page
    p_wp6 = doc.add_paragraph()
    p_wp6.paragraph_format.space_before = Pt(6)
    p_wp6.paragraph_format.space_after = Pt(2)
    r_wp6 = p_wp6.add_run("6. Generation History Page:")
    r_wp6.font.name = "Arial"
    r_wp6.font.size = Pt(12)
    r_wp6.font.bold = True

    add_image_with_caption(doc, "docs_assets/screenshot_history.png", "Figure 11: Generation History and Dataset Management Log", width=Inches(6.0))

    p_wp6_d = doc.add_paragraph()
    p_wp6_d.paragraph_format.line_spacing = 1.15
    p_wp6_d.paragraph_format.space_after = Pt(10)
    r_wp6d = p_wp6_d.add_run(
        "Description: Detailed log of all historical generation jobs stored in MongoDB. Lists dataset ID, scenario classification, document count, "
        "Gemini model used, creation timestamp, validation badge, and quick actions to reload, export to CSV/JSON, or delete datasets."
    )
    r_wp6d.font.name = "Arial"
    r_wp6d.font.size = Pt(9.5)

    # ---------------- CONCLUSION ----------------
    doc.add_page_break()
    add_header_logos(doc)

    p_concl_head = doc.add_paragraph()
    p_concl_head.paragraph_format.space_after = Pt(6)
    r_ch = p_concl_head.add_run("Conclusion & Academic Significance:")
    r_ch.font.name = "Arial"
    r_ch.font.size = Pt(15)
    r_ch.font.bold = True

    p_concl_body = doc.add_paragraph()
    p_concl_body.paragraph_format.line_spacing = 1.15
    p_concl_body.paragraph_format.space_after = Pt(10)
    r_cb = p_concl_body.add_run(
        "DiscoSynth AI successfully demonstrates a fully functional, production-grade Generative AI engineering application that addresses a real-world "
        "challenge in legal technology: the unavailability of realistic litigation document metadata for benchmarking e-discovery machine learning models.\n\n"
        "By integrating Google's Gemini 3.8 Flash model via the official Google GenAI Python SDK (google-genai), enforcing strict Pydantic v2 data contracts, "
        "and implementing an automated error-repair loop, the platform consistently generates syntactically valid, contextually coherent, and statistically representative "
        "metadata records complete with sequential Bates numbering, custodian communication graphs, privilege justifications, and responsiveness classifications.\n\n"
        "The project rigorously fulfills all academic requirements: combining modern full-stack development (FastAPI backend + React/Vite/Tailwind frontend), "
        "persistent database engineering (MongoDB Atlas and local MongoDB with unique indexed collections), prompt engineering with JSON enforcement, "
        "and thorough software testing (Pytest suite passing 100%, TypeScript build verification, and live end-to-end execution with zero mocks).\n\n"
        "Ethical Boundaries & Scope: DiscoSynth AI strictly produces synthetic metadata rather than substantive legal text. It does not ingest confidential client documents "
        "or replace legal counsel, serving as an uncompromised testing sandbox for data science and e-discovery research.\n\n"
        "Future Enhancements: Potential avenues for future expansion include integrating vector-based custodian clustering (TF-IDF / sentence-transformers), "
        "adding multi-lingual legal metadata generation, and implementing automated model evaluation pipelines to benchmark classification accuracy directly inside the platform."
    )
    r_cb.font.name = "Arial"
    r_cb.font.size = Pt(10)
    r_cb.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    # Save Word Document
    output_filename = "DiscoSynth_AI_Litigation_Metadata_Generator_Documentation.docx"
    doc.save(output_filename)
    print(f"Successfully generated Word Document: {output_filename}")

if __name__ == "__main__":
    build_documentation()
