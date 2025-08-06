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
RUN rm -rf /var/lib/apt/lists/* && \
    for i in 1 2 3; do apt-get update && break || sleep 5; done && \
    apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        g++ \
        ffmpeg \
        libsndfile1 \
        libsox-fmt-all \
        sox \
        curl \
        git \
        libjpeg-dev \
        zlib1g-dev \
        libpq-dev \
        ca-certificates \
        openssl && \
    rm -rf /var/lib/apt/lists/* && \
    update-ca-certificates

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python packages with retry mechanism
RUN pip install --upgrade pip setuptools wheel && \
    pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org --no-cache-dir -r requirements.txt || \
    (sleep 5 && pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org --no-cache-dir -r requirements.txt)

# Create directories and set permissions
RUN mkdir -p /app/uploads \
            /app/image_files \
            /app/audio_files \
            /app/media \
            /app/staticfiles \
            /app/logs && \
    chmod -R 755 /app

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app

# Copy project files
COPY --chown=appuser:appuser . .

# Entrypoint script to run migrations and collectstatic at container start
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
USER appuser

# Expose port
EXPOSE 8000

# Health check with increased timeout and start period
HEALTHCHECK --interval=30s --timeout=60s --start-period=30s --retries=3 \
    CMD curl --fail --max-time 30 http://localhost:8000/ || exit 1
