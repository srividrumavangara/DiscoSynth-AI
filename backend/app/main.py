import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import health, scenario, generation, datasets, analytics, export, auth

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("discosynth")

app = FastAPI(
    title="DiscoSynth AI – Synthetic Litigation Metadata Generator API",
    description="Generative AI backend for generating realistic synthetic litigation metadata for e-discovery benchmarking.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(scenario.router, prefix="/api")
app.include_router(generation.router, prefix="/api")
app.include_router(datasets.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(export.router, prefix="/api")

@app.get("/")
def root():
    return {
        "project": "DiscoSynth AI – Synthetic Litigation Metadata Generator",
        "status": "online",
        "docs_url": "/docs",
        "version": "1.0.0"
    }
