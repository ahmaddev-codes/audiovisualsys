#!/bin/bash

# Startup script for Azure App Service (Linux)
# This script is executed when the app starts

echo "Starting audiovisualsys application..."

# Set environment variables if not already set
export PYTHONPATH=/home/site/wwwroot
export DJANGO_SETTINGS_MODULE=audiovisualsys.settings

# Create necessary directories if they don't exist
mkdir -p /home/site/wwwroot/uploads
mkdir -p /home/site/wwwroot/image_files
mkdir -p /home/site/wwwroot/audio_files
mkdir -p /home/site/wwwroot/media
mkdir -p /home/site/wwwroot/staticfiles

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start the application with gunicorn
echo "Starting gunicorn server..."
exec gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 audiovisualsys.wsgi:application 