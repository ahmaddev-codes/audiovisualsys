# Use Python slim image
FROM python:3.11-slim

# Set environment variables
ENV PORT=8000 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=audiovisualsys.settings \
    DEBUG=False \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=100

# Set working directory
WORKDIR /app

# Install system dependencies and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Build dependencies
    build-essential \
    gcc \
    g++ \
    # Audio processing
    ffmpeg \
    libsndfile1 \
    libsox-fmt-all \
    sox \
    # Other essential tools
    curl \
    git \
    # Required for Pillow and other packages
    libjpeg-dev \
    zlib1g-dev \
    libpq-dev \
    # Cleanup
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Upgrade pip and install packages with retry mechanism
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt || \
    (sleep 5 && pip install --no-cache-dir -r requirements.txt)

# Create directories and set permissions
RUN mkdir -p uploads image_files audio_files media staticfiles logs && \
    chmod -R 755 /app

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app /uploads /image_files /audio_files /media /staticfiles /logs

# Copy project files
COPY --chown=appuser:appuser . .

USER appuser

# Collect static and migrate
RUN python manage.py collectstatic --noinput || true && \
    python manage.py migrate --noinput || true

# Expose port
EXPOSE 8000

# Health check with increased timeout and start period
HEALTHCHECK --interval=30s --timeout=60s --start-period=30s --retries=3 \
    CMD curl --fail --max-time 30 http://localhost:8000/ || exit 1

# Start command with environment-aware workers
CMD gunicorn audiovisualsys.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers ${WORKERS:-2} \
    --threads ${THREADS:-4} \
    --timeout ${TIMEOUT:-120} \
    --access-logfile - \
    --error-logfile - \
    --log-level info