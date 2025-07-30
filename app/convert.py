import os
import base64
import tempfile
import whisper
import openai
from PIL import Image
import requests
from elevenlabs import generate, save, set_api_key
from django.conf import settings
from dotenv import load_dotenv
import io

# Load environment variables
load_dotenv()


class AIConverter:
    def __init__(self):
        # Initialize OpenAI client
        self.openai_client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

        # Initialize Whisper model
        self.whisper_model = whisper.load_model("base")

        # Set ElevenLabs API key
        set_api_key(os.getenv('ELEVENLABS_API_KEY'))

    def audio_to_image(self, audio_file_path, description_prompt=""):
        """
        Convert audio to image using AI
        """
        try:
            # Transcribe audio using Whisper
            print("Transcribing audio...")
            transcription = self.whisper_model.transcribe(audio_file_path)
            audio_text = transcription['text']

            # Generate image description using GPT-4
            print("Generating image description...")
            if description_prompt:
                prompt = f"Based on this audio content: '{audio_text}', create a detailed image description for: {description_prompt}"
            else:
                prompt = f"Based on this audio content: '{audio_text}', create a detailed, vivid image description that captures the essence, mood, and visual elements described or implied in the audio."

            # Get image description from GPT-4
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert at creating detailed, vivid image descriptions based on audio content. Focus on visual elements, mood, and atmosphere."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500
            )

            image_description = response.choices[0].message.content

            # Generate image using DALL-E 3
            print("Generating image with DALL-E 3...")
            image_response = self.openai_client.images.generate(
                model="dall-e-3",
                prompt=image_description,
                size="1024x1024",
                quality="standard",
                n=1
            )

            # Download and save the generated image
            image_url = image_response.data[0].url
            image_data = requests.get(image_url).content

            # Save to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_file:
                tmp_file.write(image_data)
                output_path = tmp_file.name

            return {
                'success': True,
                'output_path': output_path,
                'transcription': audio_text,
                'image_description': image_description,
                'ai_model_used': 'whisper + gpt-4 + dall-e-3'
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'ai_model_used': 'whisper + gpt-4 + dall-e-3'
            }

    def image_to_audio(self, image_file_path, voice_preference="", description_style=""):
        """
        Convert image to audio using AI
        """
        try:
            # Analyze image using GPT-4V
            print("Analyzing image...")
            with open(image_file_path, "rb") as img_file:
                image_data = base64.b64encode(img_file.read()).decode('utf-8')

            # Create analysis prompt
            if description_style:
                analysis_prompt = f"Describe this image in detail with {description_style}. Focus on visual elements, composition, colors, mood, and any notable features."
            else:
                analysis_prompt = "Describe this image in detail. Focus on visual elements, composition, colors, mood, and any notable features that would be interesting to hear about."

            response = self.openai_client.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=[
                    {"role": "system", "content": "You are an expert at analyzing images and creating detailed, engaging descriptions suitable for audio narration."},
                    {"role": "user", "content": [
                        {"type": "text", "text": analysis_prompt},
                        {"type": "image_url", "image_url": {
                            "url": f"data:image/jpeg;base64,{image_data}"}}
                    ]}
                ],
                max_tokens=500
            )

            image_description = response.choices[0].message.content

            # Generate speech using ElevenLabs
            print("Generating speech...")
            voice = voice_preference if voice_preference else "Rachel"

            audio = generate(
                text=image_description,
                voice=voice,
                model="eleven_monolingual_v1"
            )

            # Save audio to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp_file:
                save(audio, tmp_file.name)
                output_path = tmp_file.name

            return {
                'success': True,
                'output_path': output_path,
                'image_description': image_description,
                'voice_used': voice,
                'ai_model_used': 'gpt-4v + elevenlabs'
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'ai_model_used': 'gpt-4v + elevenlabs'
            }

# Legacy functions for backward compatibility


def audio_to_image(audio_path, image_path):
    """
    Legacy function - now uses AI conversion
    """
    converter = AIConverter()
    result = converter.audio_to_image(audio_path)

    if result['success']:
        # Copy the generated image to the specified path
        import shutil
        shutil.copy2(result['output_path'], image_path)
        os.unlink(result['output_path'])  # Clean up temp file
        return True
    else:
        raise Exception(result['error'])


def image_to_audio(image_path, audio_path):
    """
    Legacy function - now uses AI conversion
    """
    converter = AIConverter()
    result = converter.image_to_audio(image_path)

    if result['success']:
        # Copy the generated audio to the specified path
        import shutil
        shutil.copy2(result['output_path'], audio_path)
        os.unlink(result['output_path'])  # Clean up temp file
        return True
    else:
        raise Exception(result['error'])
