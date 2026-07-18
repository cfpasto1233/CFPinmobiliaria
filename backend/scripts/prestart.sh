#!/usr/bin/env bash
set -e

cd /app/backend

echo "Waiting for database..."
python app/backend_pre_start.py

echo "Running migrations..."
alembic upgrade head

echo "Creating initial data..."
python app/initial_data.py

echo "Prestart complete."
