#!/bin/bash
set -e

# Run migrations and collectstatic at container start
echo "Running Django migrations..."
python manage.py migrate --noinput
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Start Gunicorn
exec gunicorn audiovisualsys.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers ${WORKERS:-2} \
    --threads ${THREADS:-4} \
    --timeout ${TIMEOUT:-120} \
    --access-logfile - \
    --error-logfile - \
    --log-level info
