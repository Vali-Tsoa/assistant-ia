"""
Module RAG — Recherche vectorielle dans ChromaDB.
Utilise les embeddings Google (text-embedding-004) via google-genai.
Plus besoin de HuggingFace ni de téléchargement de modèle local.
"""
from pathlib import Path
from app.config import settings


def get_embeddings():
    """
    Retourne le modèle d'embedding selon la configuration.
    Par défaut : Google Embeddings (aucun téléchargement requis).
    """
    if settings.embedding_provider == "openai":
        from langchain_openai import OpenAIEmbeddings
        return OpenAIEmbeddings(api_key=settings.openai_api_key)
    else:
        # Embeddings Google — même API que Gemini, aucun modèle local requis
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        return GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=settings.gemini_api_key,
        )


def search_knowledge_base(query: str, n_results: int = 3) -> list[dict]:
    """
    Recherche les passages les plus pertinents pour une requête.
    Retourne [] immédiatement si ChromaDB n'est pas encore initialisé.
    """
    # Court-circuit : si ChromaDB est vide/absent, on ne charge rien
    chroma_path = Path(settings.chroma_persist_dir)
    if not chroma_path.exists() or not any(chroma_path.iterdir()):
        return []  # RAG non initialisé — l'agent fonctionnera sans base documentaire

    try:
        from langchain_community.vectorstores import Chroma
        vectorstore = Chroma(
            persist_directory=settings.chroma_persist_dir,
            embedding_function=get_embeddings(),
            collection_name=settings.chroma_collection_name,
        )
        results = vectorstore.similarity_search_with_score(query, k=n_results)

        documents = []
        for doc, score in results:
            confidence = max(0.0, 1.0 - score)
            documents.append({
                "source": doc.metadata.get("source", "inconnu"),
                "content": doc.page_content,
                "confidence": round(confidence, 3),
            })
        return documents

    except Exception as e:
        print(f"⚠️  RAG non disponible: {e}")
        return []
