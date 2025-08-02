# 🚀 Azure App Service Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. **Code Quality & Security**
- [x] Django settings updated for production
- [x] Security headers configured
- [x] Environment variables properly handled
- [x] Debug mode configurable via environment
- [x] CSRF protection enabled
- [x] Allowed hosts configured

### 2. **Dependencies & Requirements**
- [x] requirements.txt includes all necessary packages
- [x] AI libraries (OpenAI, ElevenLabs, Whisper) included
- [x] Django and core dependencies specified
- [x] Version pinning for stability

### 3. **File Structure**
- [x] Django project structure correct
- [x] Static files configuration
- [x] Media files configuration
- [x] Templates properly organized
- [x] URL routing configured

### 4. **Azure Configuration Files**
- [x] web.config for Windows App Service
- [x] startup.txt for Azure deployment
- [x] azure.yaml configuration
- [x] GitHub Actions workflow

### 5. **Environment Variables Required**
```
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=False
OPENAI_API_KEY=your-openai-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

## 🔧 Azure Portal Configuration

### 1. **Application Settings**
Go to Azure Portal → audiovisualsys App Service → Configuration → Application settings

Add these settings:
```
WEBSITE_NODE_DEFAULT_VERSION = ~18
PYTHON_VERSION = 3.11
SCM_DO_BUILD_DURING_DEPLOYMENT = true
DJANGO_SETTINGS_MODULE = audiovisualsys.settings
PYTHONPATH = /home/site/wwwroot
DJANGO_SECRET_KEY = [generate-secure-key]
DEBUG = False
OPENAI_API_KEY = [your-openai-key]
ELEVENLABS_API_KEY = [your-elevenlabs-key]
```

### 2. **General Settings**
- [ ] Python version: 3.11
- [ ] Operating System: Windows
- [ ] Stack: Python

## 🔑 GitHub Secrets Setup

### 1. **Required Secrets**
Go to GitHub → Settings → Secrets and variables → Actions

Add these secrets:
```
AZURE_WEBAPP_PUBLISH_PROFILE = [download from Azure Portal]
```

### 2. **Publish Profile**
1. Go to Azure Portal → audiovisualsys App Service
2. Overview → Get publish profile
3. Download the file
4. Copy the content to GitHub secret

## 📁 Required Directories

The deployment will create these directories:
- [x] uploads/ (for uploaded files)
- [x] image_files/ (for generated images)
- [x] audio_files/ (for generated audio)
- [x] media/ (for media files)
- [x] staticfiles/ (for collected static files)

## 🚀 Deployment Steps

### 1. **Local Testing**
```bash
# Test the application locally
python manage.py runserver
# Visit http://127.0.0.1:8000
```

### 2. **GitHub Actions**
1. Push changes to main branch
2. Monitor deployment in GitHub Actions
3. Check for any build errors

### 3. **Post-Deployment Verification**
- [ ] Application loads without errors
- [ ] Static files are served correctly
- [ ] File uploads work
- [ ] AI conversions work
- [ ] Error logging works

## 🔍 Troubleshooting

### Common Issues:
1. **Static files not loading**: Run `python manage.py collectstatic`
2. **Database errors**: Run `python manage.py migrate`
3. **API key errors**: Check environment variables in Azure Portal
4. **File permission errors**: Check directory permissions

### Logs to Check:
- Azure Portal → Log stream
- GitHub Actions → Deployment logs
- Application error logs

## 📊 Monitoring

### 1. **Azure Monitor**
- Application Insights (if enabled)
- Log stream for real-time logs
- Metrics for performance

### 2. **Application Logs**
- error.log file
- Console logs in Azure Portal
- GitHub Actions deployment logs

## 🔒 Security Checklist

- [x] DEBUG = False in production
- [x] SECRET_KEY from environment variable
- [x] CSRF protection enabled
- [x] HTTPS redirect enabled
- [x] Security headers configured
- [x] API keys in environment variables

## 📝 Post-Deployment Tasks

1. **Test all functionality**:
   - Audio recording
   - File uploads
   - AI conversions
   - Error handling

2. **Monitor performance**:
   - Response times
   - Memory usage
   - API call success rates

3. **Set up monitoring**:
   - Application Insights (optional)
   - Error alerting
   - Performance monitoring

## 🎯 Success Criteria

- [ ] Application deploys without errors
- [ ] All features work correctly
- [ ] Error handling works properly
- [ ] Performance is acceptable
- [ ] Security measures are in place
- [ ] Monitoring is configured

---

**Last Updated**: August 1st, 2025
**Status**: Ready for Deployment ✅
