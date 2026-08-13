.PHONY: install run ingest seed test clean

install:
	pip install -r requirements.txt

run:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

ingest:
	python scripts/ingest_kb.py

seed:
	python scripts/seed_data.py

test:
	pytest tests/ -v

init-db:
	python -c "from app.db.init_db import init_database; init_database()"

clean:
	rm -rf chroma_db/ maintenance_ia.db __pycache__ .pytest_cache

dev: seed ingest run
