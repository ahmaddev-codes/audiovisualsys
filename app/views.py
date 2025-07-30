
import os
import base64
import json
from pathlib import Path
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from . import convert
from .models import ConversionSession, AudioRecording

BASE_DIR = Path(__file__).resolve().parent.parent


@csrf_exempt
def homepage(request):
    try:
        if request.method == 'POST':
            if 'audio_file' in request.FILES:
                return ai_audio_to_image(request)
            elif 'image_file' in request.FILES:
                return ai_image_to_audio(request)
            elif 'recorded_audio' in request.POST:
                return handle_recorded_audio(request)
            else:
                return JsonResponse({'error': 'No file provided'}, status=400)
        else:
            return render(request, 'index.html', status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def ai_audio_to_image(request):
    """AI-powered audio to image conversion"""
    try:
        print("Received audio file for AI conversion.")

        # Create directories if they don't exist
        image_dir = BASE_DIR / "image_files"
        os.makedirs(image_dir, exist_ok=True)

        # Get form data
        input_audio = request.FILES['audio_file']
        description_prompt = request.POST.get('description_prompt', '')

        # Create conversion session
        session = ConversionSession.objects.create(
            conversion_type='audio_to_image',
            input_file=input_audio,
            description_prompt=description_prompt,
            processing_status='processing'
        )

        # Save input file
        input_path = BASE_DIR / "uploads" / f"audio_{session.session_id}.wav"
        os.makedirs(input_path.parent, exist_ok=True)

        with open(input_path, 'wb+') as destination:
            for chunk in input_audio.chunks():
                destination.write(chunk)

        # Convert using AI
        converter = convert.AIConverter()
        result = converter.audio_to_image(str(input_path), description_prompt)

        if result['success']:
            # Save output image
            output_path = image_dir / f"ai_generated_{session.session_id}.png"
            import shutil
            shutil.copy2(result['output_path'], output_path)
            os.unlink(result['output_path'])  # Clean up temp file

            # Update session
            session.output_file = str(output_path)
            session.ai_model_used = result['ai_model_used']
            session.processing_status = 'completed'
            session.completed_at = timezone.now()
            session.save()

            # Read image file data
            with open(output_path, "rb") as img_file:
                image_data = base64.b64encode(img_file.read()).decode('utf-8')

            # Return response with image data and metadata
            response_data = {
                'type': 'image',
                'image': image_data,
                'transcription': result.get('transcription', ''),
                'image_description': result.get('image_description', ''),
                'session_id': str(session.session_id),
                'ai_model_used': result['ai_model_used']
            }

            print("Sending AI-generated image data as response.")
            return JsonResponse(response_data, content_type='application/json', status=200)
        else:
            # Update session with error
            session.processing_status = 'failed'
            session.error_message = result['error']
            session.save()

            return JsonResponse({'error': result['error']}, status=500)

    except Exception as e:
        print(f"Error in ai_audio_to_image: {e}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def ai_image_to_audio(request):
    """AI-powered image to audio conversion"""
    try:
        print("Received image file for AI conversion.")

        # Create directories if they don't exist
        audio_dir = BASE_DIR / "audio_files"
        os.makedirs(audio_dir, exist_ok=True)

        # Get form data
        input_image = request.FILES['image_file']
        voice_preference = request.POST.get('voice_preference', 'Rachel')
        description_style = request.POST.get('description_style', '')

        print(f"Processing image: {input_image.name}")
        print(f"Voice preference: {voice_preference}")
        print(f"Description style: {description_style}")

        # Create conversion session
        session = ConversionSession.objects.create(
            conversion_type='image_to_audio',
            input_file=input_image,
            description_prompt=f"Voice: {voice_preference}, Style: {description_style}",
            processing_status='processing'
        )

        # Save input file
        input_path = BASE_DIR / "uploads" / f"image_{session.session_id}.png"
        os.makedirs(input_path.parent, exist_ok=True)

        with open(input_path, 'wb+') as destination:
            for chunk in input_image.chunks():
                destination.write(chunk)

        print(f"Saved input image to: {input_path}")

        # Convert using AI
        converter = convert.AIConverter()
        print("Starting AI conversion...")
        result = converter.image_to_audio(
            str(input_path), voice_preference, description_style)

        print(f"AI conversion result: {result}")

        if result['success']:
            # Save output audio
            output_path = audio_dir / f"ai_generated_{session.session_id}.mp3"
            import shutil
            shutil.copy2(result['output_path'], output_path)
            os.unlink(result['output_path'])  # Clean up temp file

            print(f"Saved output audio to: {output_path}")

            # Update session
            session.output_file = str(output_path)
            session.ai_model_used = result['ai_model_used']
            session.processing_status = 'completed'
            session.completed_at = timezone.now()
            session.save()

            # Read audio file data
            with open(output_path, "rb") as audio_file:
                audio_data = base64.b64encode(
                    audio_file.read()).decode('utf-8')

            response_data = {
                'type': 'audio',
                'audio': audio_data,
                'image_description': result.get('image_description', ''),
                'voice_used': result.get('voice_used', 'Rachel'),
                'session_id': str(session.session_id),
                'ai_model_used': result['ai_model_used']
            }

            print("Sending AI-generated audio data as response.")
            return JsonResponse(response_data, content_type='application/json', status=200)
        else:
            # Update session with error
            session.processing_status = 'failed'
            session.error_message = result['error']
            session.save()

            error_response = {
                'type': 'error',
                'error': result['error']
            }
            print(f"AI conversion failed: {result['error']}")
            return JsonResponse(error_response, status=500)

    except Exception as e:
        print(f"Error in ai_image_to_audio: {e}")
        import traceback
        traceback.print_exc()
        error_response = {
            'type': 'error',
            'error': str(e)
        }
        return JsonResponse(error_response, status=500)


@csrf_exempt
def handle_recorded_audio(request):
    """Handle recorded audio from the frontend"""
    try:
        print("Received recorded audio data.")

        # Get the base64 audio data
        audio_data = request.POST.get('recorded_audio')
        description_prompt = request.POST.get('description_prompt', '')

        if not audio_data:
            return JsonResponse({'error': 'No audio data provided'}, status=400)

        # Decode base64 audio data
        audio_bytes = base64.b64decode(
            audio_data.split(',')[1])  # Remove data URL prefix

        # Create conversion session
        session = ConversionSession.objects.create(
            conversion_type='audio_to_image',
            description_prompt=description_prompt,
            processing_status='processing'
        )

        # Save recorded audio
        audio_dir = BASE_DIR / "uploads"
        os.makedirs(audio_dir, exist_ok=True)
        input_path = audio_dir / f"recorded_{session.session_id}.wav"

        with open(input_path, 'wb') as f:
            f.write(audio_bytes)

        # Convert using AI
        converter = convert.AIConverter()
        result = converter.audio_to_image(str(input_path), description_prompt)

        if result['success']:
            # Save output image
            image_dir = BASE_DIR / "image_files"
            os.makedirs(image_dir, exist_ok=True)
            output_path = image_dir / f"ai_generated_{session.session_id}.png"

            import shutil
            shutil.copy2(result['output_path'], output_path)
            os.unlink(result['output_path'])  # Clean up temp file

            # Update session
            session.output_file = str(output_path)
            session.ai_model_used = result['ai_model_used']
            session.processing_status = 'completed'
            session.completed_at = timezone.now()
            session.save()

            # Read image file data
            with open(output_path, "rb") as img_file:
                image_data = base64.b64encode(img_file.read()).decode('utf-8')

            response_data = {
                'type': 'image',
                'image': image_data,
                'transcription': result.get('transcription', ''),
                'image_description': result.get('image_description', ''),
                'session_id': str(session.session_id),
                'ai_model_used': result['ai_model_used']
            }

            print("Sending AI-generated image from recorded audio.")
            return JsonResponse(response_data, content_type='application/json', status=200)
        else:
            # Update session with error
            session.processing_status = 'failed'
            session.error_message = result['error']
            session.save()

            return JsonResponse({'error': result['error']}, status=500)

    except Exception as e:
        print(f"Error in handle_recorded_audio: {e}")
        return JsonResponse({'error': str(e)}, status=500)

# Legacy functions for backward compatibility

@csrf_exempt
def audio_to_image(request):
    """Legacy audio to image conversion"""
    return ai_audio_to_image(request)


@csrf_exempt
def image_to_audio(request):
    """Legacy image to audio conversion"""
    return ai_image_to_audio(request)
