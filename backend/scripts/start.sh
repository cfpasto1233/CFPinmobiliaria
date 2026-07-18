#!/usr/bin/env bash
set -e

bash /app/backend/scripts/prestart.sh

exec /app/.venv/bin/fastapi run --workers 2 /app/backend/app/main.py --port "${PORT:-8000}"
