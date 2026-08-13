"""
Module RAG — Recherche vectorielle dans ChromaDB.
"""
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_openai import OpenAIEmbeddings

from app.config import settings


def get_embeddings():
    """Retourne le modèle d'embedding selon la configuration."""
    if settings.embedding_provider == "openai":
        return OpenAIEmbeddings(api_key=settings.openai_api_key)
    else:  # huggingface (défaut, local, gratuit)
        return HuggingFaceEmbeddings(
            model_name=settings.embedding_model,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )


def get_vectorstore() -> Chroma:
    """Ouvre la collection ChromaDB existante."""
    embeddings = get_embeddings()
    return Chroma(
        persist_directory=settings.chroma_persist_dir,
        embedding_function=embeddings,
        collection_name=settings.chroma_collection_name,
    )


def search_knowledge_base(query: str, n_results: int = 3) -> list[dict]:
    """
    Recherche les passages les plus pertinents pour une requête.
    Retourne une liste de {source, content, score}.
    """
    try:
        vectorstore = get_vectorstore()
        results = vectorstore.similarity_search_with_score(query, k=n_results)

        documents = []
        for doc, score in results:
            # Score ChromaDB: distance cosinus (plus bas = plus similaire)
            # Convertir en score de confiance 0-1
            confidence = max(0.0, 1.0 - score)
            documents.append({
                "source": doc.metadata.get("source", "inconnu"),
                "content": doc.page_content,
                "confidence": round(confidence, 3),
            })

        return documents

    except Exception as e:
        # ChromaDB vide ou non initialisé
        print(f"⚠️  RAG non disponible: {e}")
        return []
