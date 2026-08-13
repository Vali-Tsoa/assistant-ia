# mAIntenance & Assistance — Système AI ISPM

> Système d'assistance IA pour la maintenance informatique de l'ISPM (Institut Supérieur de la Pêche Maritime)

## 🏗️ Architecture

```
assistant-ia/
├── backend/              # 🐍 FastAPI + LangChain + ChromaDB
├── frontend-client/      # 💬 Interface Chat (Next.js + shadcn/ui)
└── frontend-dashboard/   # 📊 Dashboard Technicien (Next.js + shadcn/ui)
```

## 🚀 Démarrage Rapide

### 1. Backend FastAPI

```bash
cd backend

# Installer les dépendances
pip install -r requirements.txt

# Configurer l'environnement (choisir votre LLM dans .env)
cp .env.example .env
# Éditer .env : LLM_PROVIDER=ollama|openai|groq

# Initialiser la base de données + données de test
make seed

# Indexer la base de connaissance RAG
make ingest

# Lancer le serveur
make run
# → http://localhost:8000
# → Swagger UI: http://localhost:8000/docs
```

### 2. Interface Client (Chat)

```bash
cd frontend-client
npm install
npm run dev
# → http://localhost:3000
```

### 3. Dashboard Technicien

```bash
cd frontend-dashboard
npm install
npm run dev
# → http://localhost:3001
```

---

## 🤖 Configuration LLM

Éditer `backend/.env` :

| Provider | Modèle | Requis |
|----------|--------|--------|
| `ollama` | `llama3.1` | Ollama installé localement |
| `openai` | `gpt-4o` | Clé API OpenAI |
| `groq` | `llama3-8b-8192` | Clé API Groq (gratuit) |

---

## 📡 Endpoints Backend

| Méthode | URL | Description |
|---------|-----|-------------|
| `POST` | `/chat` | Envoyer un message à l'agent |
| `WS` | `/chat/ws/{ticket_id}` | Chat WebSocket temps réel |
| `GET` | `/tickets` | Liste des tickets |
| `GET` | `/tickets/{id}/history` | Historique d'un ticket |
| `PATCH` | `/tickets/{id}` | Mettre à jour un ticket |
| `GET` | `/observability/metrics` | Métriques système AI |
| `GET` | `/observability/traces` | Traces d'exécution agent |
| `GET` | `/docs` | Documentation Swagger |

---

## 🔬 Test Rapide

```bash
# Tester l'agent
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Mon réseau ne fonctionne plus depuis ce matin",
    "user_id": "USR-001"
  }'
```

---

## 📚 Base de Connaissance RAG

Les fiches KB se trouvent dans `backend/app/rag/kb_docs/` :

- `KB-NET-01.md` — Pannes réseau et connectivité
- `KB-NET-04.md` — VPN et accès distant
- `KB-ACCT-01.md` — Gestion des comptes et accès

Pour ajouter un nouveau document : créer un fichier `.md` dans ce dossier, puis relancer `make ingest`.

---

## 🛡️ Sécurité (Guardrails)

Le système détecte automatiquement :
- **Prompt Injection** : tentatives de manipulation de l'agent
- **Données sensibles** : mots de passe, numéros de carte en clair
- **Actions à haut risque** : réinitialisation admin, modification droits → validation humaine requise

---

*Projet ISPM — M2 Machine Learning — 2026*