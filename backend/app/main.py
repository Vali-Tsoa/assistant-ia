"""
Point d'entrée principal — FastAPI Application
mAIntenance Assistant ISPM
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.db.init_db import init_database
from app.api import chat, tickets, observability


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialisation au démarrage de l'application."""
    print(f"🚀 Démarrage de {settings.app_name} v{settings.app_version}")
    print(f"🤖 LLM: {settings.llm_provider}/{settings.llm_model}")
    print(f"🗄️  Database: {settings.database_url}")

    # Initialiser la base de données
    init_database()

    yield

    print("👋 Arrêt du serveur")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Assistant IA de maintenance informatique pour l'ISPM — Système RAG + LangChain",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ROUTERS ──────────────────────────────────────────────────────────────────
app.include_router(chat.router)
app.include_router(tickets.router)
app.include_router(observability.router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "chat": "POST /chat",
            "chat_ws": "WS /chat/ws/{ticket_id}",
            "tickets": "GET/PATCH /tickets",
            "metrics": "GET /observability/metrics",
            "traces": "GET /observability/traces",
        },
    }
