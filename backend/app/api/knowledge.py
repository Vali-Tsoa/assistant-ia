from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
import os
from app.rag.ingestor import ingest_all_documents

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])

KB_DOCS_DIR = Path(__file__).parent.parent / "rag" / "kb_docs"

class DocUpdate(BaseModel):
    filename: str
    content: str

class DocCreate(BaseModel):
    title: str  # e.g., "KB-NET-05 — Problème d'accès Wi-Fi"
    content: str

@router.get("")
async def list_documents():
    """Liste tous les documents de la base de connaissances."""
    docs = []
    if not KB_DOCS_DIR.exists():
        return docs
    for path in KB_DOCS_DIR.glob("*.md"):
        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            docs.append({
                "filename": path.name,
                "title": path.stem,
                "content": content,
                "size": path.stat().st_size
            })
        except Exception as e:
            print(f"Error reading {path.name}: {e}")
    # Trier par nom de fichier
    docs.sort(key=lambda x: x["filename"])
    return docs

@router.post("")
async def create_or_update_document(doc: DocUpdate):
    """Crée ou met à jour un document et déclenche la réindexation RAG."""
    # Nettoyer et valider le nom de fichier
    filename = doc.filename.strip()
    if not filename.endswith(".md"):
        filename += ".md"
    
    # Éviter la traversée de répertoires
    safe_filename = Path(filename).name
    target_path = KB_DOCS_DIR / safe_filename

    # Assurer que le dossier existe
    KB_DOCS_DIR.mkdir(parents=True, exist_ok=True)

    try:
        with open(target_path, "w", encoding="utf-8") as f:
            f.write(doc.content)
        
        # Ré-indexer ChromaDB après modification
        chunks_count = ingest_all_documents()
        
        return {
            "success": True,
            "filename": safe_filename,
            "chunks_indexed": chunks_count,
            "message": f"Document indexé avec succès ({chunks_count} chunks)."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur d'écriture ou d'indexation : {str(e)}")

@router.delete("/{filename}")
async def delete_document(filename: str):
    """Supprime un document de la base de connaissances et réindexe."""
    safe_filename = Path(filename).name
    target_path = KB_DOCS_DIR / safe_filename

    if not target_path.exists():
        raise HTTPException(status_code=404, detail="Document non trouvé")

    try:
        os.remove(target_path)
        
        # Ré-indexer ChromaDB après suppression
        chunks_count = ingest_all_documents()
        
        return {
            "success": True,
            "message": "Document supprimé avec succès.",
            "chunks_indexed": chunks_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de suppression : {str(e)}")
