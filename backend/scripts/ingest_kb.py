"""
Script d'ingestion RAG — Lance l'indexation de tous les documents KB.
Usage: python scripts/ingest_kb.py
"""
import sys
import os

# Ajouter le répertoire parent au path Python
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.rag.ingestor import ingest_all_documents

if __name__ == "__main__":
    print("=" * 60)
    print("mAIntenance Assistant — Ingestion Base de Connaissance RAG")
    print("=" * 60)
    count = ingest_all_documents()
    print("=" * 60)
    if count > 0:
        print(f"✅ Succès: {count} chunks indexés dans ChromaDB")
    else:
        print("❌ Échec: aucun chunk indexé")
    print("=" * 60)
