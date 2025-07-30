# 🤖 AI AudioVisual Interconversion System

A cutting-edge web application that uses artificial intelligence to convert between audio and images. Powered by OpenAI Whisper, GPT-4, DALL-E 3, and ElevenLabs for state-of-the-art AI processing.

![project image](./ext.images/app_img.png)

## ✨ Features

### 🎤 Audio to Image (AI-Powered)
- **Real-time Audio Recording**: Record audio directly in your browser
- **File Upload**: Upload existing audio files
- **AI Transcription**: Uses OpenAI Whisper for accurate speech-to-text
- **Smart Image Generation**: GPT-4 creates detailed image descriptions
- **DALL-E 3 Integration**: Generates high-quality images from audio content
- **Custom Prompts**: Add your own descriptions to guide image generation

### 🖼️ Image to Audio (AI-Powered)
- **Image Analysis**: GPT-4V analyzes image content and context
- **Natural Voice Generation**: ElevenLabs creates human-like speech
- **Multiple Voice Options**: Choose from various voice personalities
- **Custom Description Styles**: Specify how you want the audio to sound
- **Detailed Audio Descriptions**: Get comprehensive image descriptions in audio format

### 🎯 Key AI Technologies
- **OpenAI Whisper**: Speech recognition and transcription
- **GPT-4**: Natural language processing and image description generation
- **DALL-E 3**: High-quality image generation from text descriptions
- **GPT-4V**: Advanced image analysis and understanding
- **ElevenLabs**: Natural-sounding text-to-speech conversion

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.8 or higher
- OpenAI API key
- ElevenLabs API key

### 2. Clone the Repository
```bash
git clone <your-repository-url>
cd audiovisualsys
```

### 3. Set Up Environment Variables
Create a `.env` file in the project root:
```bash
# AI API Keys
OPENAI_API_KEY=your_openai_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Run Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Start the Development Server
```bash
python manage.py runserver
```

### 7. Access the Application
Open your browser and navigate to:
```
http://127.0.0.1:8000/
```

## 🔧 API Key Setup

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Add it to your `.env` file

### ElevenLabs API Key
1. Visit [ElevenLabs](https://elevenlabs.io/)
2. Create an account or sign in
3. Go to your profile settings
4. Copy your API key
5. Add it to your `.env` file

## 🎮 How to Use

### Audio to Image Conversion
1. **Record Audio**: Click "🎤 Start Recording" and speak into your microphone
2. **Upload Audio**: Or upload an existing audio file
3. **Add Description** (Optional): Describe what you want to see generated
4. **Generate**: Click "🎨 Generate Image with AI"
5. **View Results**: See your AI-generated image with processing details

### Image to Audio Conversion
1. **Upload Image**: Select an image file to analyze
2. **Choose Voice**: Select from available voice options
3. **Add Style** (Optional): Describe how you want the audio to sound
4. **Generate**: Click "🎵 Generate Audio with AI"
5. **Listen**: Play the AI-generated audio description

## 🏗️ Architecture

```
AI AudioVisual System
├── Frontend (Django Templates + JavaScript)
│   ├── Real-time Audio Recording
│   ├── File Upload Interface
│   └── AI Results Display
├── Backend (Django + AI APIs)
│   ├── Audio Processing (Whisper)
│   ├── Image Generation (DALL-E 3)
│   ├── Image Analysis (GPT-4V)
│   └── Speech Synthesis (ElevenLabs)
└── Database (SQLite)
    ├── Conversion Sessions
    └── Audio Recordings
```

## 🔍 Technical Details

### AI Processing Pipeline

#### Audio → Image
1. **Audio Input**: Record or upload audio file
2. **Speech Recognition**: OpenAI Whisper transcribes audio to text
3. **Description Generation**: GPT-4 creates detailed image description
4. **Image Generation**: DALL-E 3 generates high-quality image
5. **Output**: Display generated image with metadata

#### Image → Audio
1. **Image Input**: Upload image file
2. **Image Analysis**: GPT-4V analyzes image content
3. **Description Generation**: Creates detailed audio description
4. **Speech Synthesis**: ElevenLabs converts text to speech
5. **Output**: Play generated audio with metadata

### Database Models
- **ConversionSession**: Tracks all AI conversion sessions
- **AudioRecording**: Stores recorded audio data
- **ImageUpload/AudioUpload**: Legacy models for file uploads

## 🛠️ Development

### Project Structure
```
audiovisualsys/
├── app/
│   ├── convert.py          # AI conversion logic
│   ├── models.py           # Database models
│   ├── views.py            # Django views
│   └── templates/          # HTML templates
├── static/
│   ├── css/               # Stylesheets
│   └── js/                # JavaScript
├── audiovisualsys/
│   ├── settings.py        # Django settings
│   └── urls.py           # URL configuration
└── requirements.txt       # Python dependencies
```

### Adding New Features
1. **New AI Models**: Add to `convert.py` AIConverter class
2. **UI Enhancements**: Modify templates and JavaScript
3. **Database Changes**: Update models and run migrations
4. **API Integration**: Add new API keys to settings

## 🚨 Troubleshooting

### Common Issues

#### Microphone Access
- Ensure browser has microphone permissions
- Check if microphone is working in other applications
- Try refreshing the page and granting permissions again

#### API Key Errors
- Verify API keys are correctly set in `.env` file
- Check API key validity and remaining credits
- Ensure environment variables are loaded

#### File Upload Issues
- Check file size (max 10MB)
- Verify file format is supported
- Clear browser cache and try again

#### AI Processing Errors
- Check internet connection
- Verify API service status
- Review error logs in browser console

### Debug Mode
Enable debug logging by setting `DEBUG = True` in `settings.py`

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review error logs
- Create an issue in the repository

---

**Note**: This application requires active internet connection and valid API keys for AI processing. Make sure you have sufficient API credits for your intended usage.
