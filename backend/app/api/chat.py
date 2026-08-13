"""
Routers API — Chat & WebSocket
"""
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.schemas import ChatRequest, ChatResponse
from app.core.agent import MaintenanceAgent

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=dict)
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Endpoint REST principal pour le chat avec l'agent.
    Reçoit un message et retourne la réponse structurée JSON.
    """
    try:
        agent = MaintenanceAgent(db)
        response = agent.process_message(
            user_id=request.user_id,
            message=request.message,
            ticket_id=request.ticket_id,
        )
        return response
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur agent: {str(e)}")


@router.websocket("/ws/{ticket_id}")
async def websocket_chat(websocket: WebSocket, ticket_id: str, db: Session = Depends(get_db)):
    """
    WebSocket pour le chat en temps réel.
    Permet le streaming des réponses de l'agent.
    """
    await websocket.accept()
    agent = MaintenanceAgent(db)

    try:
        while True:
            # Recevoir le message du client
            data = await websocket.receive_text()
            payload = json.loads(data)

            user_id = payload.get("user_id", "USR-001")
            message = payload.get("message", "")

            if not message:
                continue

            # Traiter avec l'agent
            response = agent.process_message(
                user_id=user_id,
                message=message,
                ticket_id=ticket_id,
            )

            # Envoyer la réponse
            await websocket.send_text(json.dumps(response, ensure_ascii=False))

    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_text(json.dumps({"error": str(e)}))
        await websocket.close()
