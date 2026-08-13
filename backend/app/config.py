"""
Configuration centralisée du backend mAIntenance Assistant.
Charge les variables d'environnement depuis .env
"""
from pydantic_settings import BaseSettings
from typing import Literal


class Settings(BaseSettings):
    # Application
    app_name: str = "mAIntenance Assistant"
    app_version: str = "1.0.0"
    debug: bool = True

    # LLM
    llm_provider: Literal["openai", "ollama", "groq", "gemini"] = "gemini"
    llm_model: str = "gemini-1.5-pro"
    gemini_api_key: str = ""
    openai_api_key: str = ""
    groq_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"

    # Embeddings
    embedding_provider: Literal["huggingface", "openai", "google"] = "google"
    embedding_model: str = "models/text-embedding-004"

    # Database
    database_url: str = "sqlite:///./maintenance_ia.db"

    # ChromaDB
    chroma_persist_dir: str = "./chroma_db"
    chroma_collection_name: str = "ispm_knowledge_base"

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:3001"

    # Security
    secret_key: str = "dev-secret-key-change-in-production"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
