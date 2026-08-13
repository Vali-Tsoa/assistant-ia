"""
Module RAG — Ingestion des documents de la base de connaissance.
Découpe les fiches KB en chunks et les stocke dans ChromaDB.
"""
import os
from pathlib import Path
from langchain_community.document_loaders import UnstructuredMarkdownLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma

from app.config import settings
from app.rag.retriever import get_embeddings


KB_DOCS_DIR = Path(__file__).parent / "kb_docs"


def ingest_all_documents() -> int:
    """
    Ingère tous les documents Markdown du dossier kb_docs/.
    Retourne le nombre de chunks créés.
    """
    print("📚 Démarrage de l'ingestion RAG...")

    # Charger tous les fichiers .md
    documents = []
    for md_file in KB_DOCS_DIR.glob("*.md"):
        print(f"  → Chargement: {md_file.name}")
        try:
            loader = TextLoader(str(md_file), encoding="utf-8")
            docs = loader.load()
            # Ajouter le nom du fichier comme métadonnée source
            for doc in docs:
                doc.metadata["source"] = md_file.stem
                doc.metadata["filename"] = md_file.name
            documents.extend(docs)
        except Exception as e:
            print(f"  ⚠️  Erreur sur {md_file.name}: {e}")

    if not documents:
        print("❌ Aucun document trouvé dans kb_docs/")
        return 0

    print(f"📄 {len(documents)} document(s) chargé(s)")

    # Découpage en chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n## ", "\n### ", "\n\n", "\n", " "],
    )
    chunks = text_splitter.split_documents(documents)
    print(f"✂️  {len(chunks)} chunks créés")

    # Stockage dans ChromaDB
    embeddings = get_embeddings()
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=settings.chroma_persist_dir,
        collection_name=settings.chroma_collection_name,
    )

    print(f"✅ {len(chunks)} chunks stockés dans ChromaDB ({settings.chroma_persist_dir})")
    return len(chunks)


if __name__ == "__main__":
    count = ingest_all_documents()
    print(f"\n🎉 Ingestion terminée: {count} chunks indexés")
