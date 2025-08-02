#!/bin/bash

# Docker deployment script for audiovisualsys

echo "🐳 Building Docker image..."
docker build -t audiovisualsys .

echo "🧪 Testing container locally..."
docker run -d --name audiovisualsys-test -p 8000:8000 \
  -e DJANGO_SECRET_KEY="test-secret-key" \
  -e DEBUG=False \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  -e ELEVENLABS_API_KEY="$ELEVENLABS_API_KEY" \
  audiovisualsys

echo "⏳ Waiting for container to start..."
sleep 10

echo "🔍 Checking if application is running..."
if curl -f http://localhost:8000/ > /dev/null 2>&1; then
    echo "✅ Application is running successfully!"
    echo "🌐 Visit: http://localhost:8000"
else
    echo "❌ Application failed to start"
    docker logs audiovisualsys-test
fi

echo "🧹 Cleaning up test container..."
docker stop audiovisualsys-test
docker rm audiovisualsys-test

echo "✅ Docker deployment test completed!" 