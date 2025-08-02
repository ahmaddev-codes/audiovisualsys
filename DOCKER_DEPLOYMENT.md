# 🐳 Docker Deployment Guide

## Overview

This guide explains how to deploy the audiovisualsys Django application using Docker containers.

## 📁 Docker Files

- `Dockerfile` - Main container configuration
- `docker-compose.yml` - Local development setup
- `.dockerignore` - Files to exclude from build
- `deploy.sh` - Local deployment script

## 🚀 Quick Start

### Local Development

1. **Build the image:**
   ```bash
   docker build -t audiovisualsys .
   ```

2. **Run with docker-compose:**
   ```bash
   docker-compose up
   ```

3. **Or run directly:**
   ```bash
   docker run -p 8000:8000 audiovisualsys
   ```

### Production Deployment

1. **Build and test locally:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

2. **Deploy via GitHub Actions:**
   - Push to main branch
   - GitHub Actions builds and deploys automatically

## 🔧 Configuration

### Environment Variables

For **Azure App Service**, set only these 3 essential variables:

```bash
DJANGO_SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

**Note:** All other environment variables are handled by the Docker container.

### Azure App Service Setup

1. **App Service Plan:** Linux (required for containers)
2. **Deployment Method:** Container
3. **Environment Variables:** Only the 3 listed above
4. **Remove these settings (not needed for Docker):**
   - DEBUG
   - DJANGO_SETTINGS_MODULE
   - PYTHON_VERSION
   - PYTHONPATH
   - SCM_DO_BUILD_DURING_DEPLOYMENT
   - WEBSITE_NODE_DEFAULT_VERSION

## 📊 GitHub Actions Deployment

The `.github/workflows/deploy-docker.yml` workflow will:

1. Build Docker image
2. Deploy to Azure Web App
3. Run health checks

### Required Secrets

Add these secrets to your GitHub repository:

- `AZURE_WEBAPP_PUBLISH_PROFILE` - Azure App Service publish profile

**Note:** No container registry secrets needed - direct deployment to Azure.

## 🔍 Troubleshooting

### Common Issues

1. **Build fails:**
   - Check Dockerfile syntax
   - Verify all dependencies in requirements.txt
   - Ensure .dockerignore excludes unnecessary files

2. **Container won't start:**
   - Check environment variables in Azure Portal
   - Verify port configuration
   - Check logs: `docker logs container-name`

3. **Audio processing fails:**
   - Ensure system dependencies are installed (ffmpeg, sox)
   - Check audio file permissions

### Debug Commands

```bash
# Check container logs
docker logs audiovisualsys

# Enter container shell
docker exec -it audiovisualsys /bin/bash

# Check container status
docker ps -a

# Remove all containers
docker system prune -a
```

## 🎯 Benefits of Docker Deployment

- ✅ **Consistency** - Same environment everywhere
- ✅ **Isolation** - No conflicts with system dependencies
- ✅ **Scalability** - Easy to scale horizontally
- ✅ **Portability** - Run anywhere Docker is available
- ✅ **Version Control** - Track application state with images
- ✅ **Simplified Azure Setup** - Only 3 environment variables needed

## 📈 Performance

- **Image Size:** ~1.5GB (includes all AI dependencies)
- **Startup Time:** ~30-60 seconds
- **Memory Usage:** ~512MB-1GB
- **CPU Usage:** Varies based on AI processing

## 🔒 Security

- Non-root user in container
- Minimal base image (python:3.11-slim)
- Environment variables for secrets
- No sensitive data in image

## 🚀 Deployment Steps

1. **Set up Azure App Service:**
   - Create Linux App Service
   - Configure as Container deployment
   - Set 3 environment variables

2. **Configure GitHub Secrets:**
   - Add `AZURE_WEBAPP_PUBLISH_PROFILE`

3. **Deploy:**
   - Push to main branch
   - Monitor GitHub Actions
   - Check application health

---

**Last Updated:** August 2nd, 2025
**Status:** Ready for Docker Deployment ✅ 