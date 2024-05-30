
import os
import base64
from pathlib import Path
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from . import convert


BASE_DIR = Path(__file__).resolve().parent.parent
# PATH_TO_MODEL = BASE_DIR.joinpath("homepage/trained_model.h5")
# Load the model
# model = load_model(PATH_TO_MODEL)

@csrf_exempt
def homepage(request):
    try:
        if request.method == 'POST':
            if 'audio_file' in request.FILES:
                return audio_to_image(request)
            elif 'image_file' in request.FILES:
                return image_to_audio(request)
            else:
                return JsonResponse({'error': 'No file provided'}, status=400)
        else:
            return render(request, 'index.html', status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def audio_to_image(request):
    try:
        print("Received audio file.")
        # Create directories if they don't exist
        image_dir = BASE_DIR / "image_files"
        os.makedirs(image_dir, exist_ok=True)

        # Input audio and image paths
        input_audio = request.FILES['audio_file']
        output_image = image_dir / "output_image.png"

        # Convert audio to image
        convert.audio_to_image(input_audio, output_image)

        # Read image file data
        with open(output_image, "rb") as img_file:
            image_data = base64.b64encode(img_file.read()).decode('utf-8')

        # Return response with image data
        response_data = {
            'type': 'image',
            'image': image_data,
        }

        print("Sending image data as response.")
        return JsonResponse(response_data, content_type='application/json', status=200)

    except Exception as e:
        print(f"Error in audio_to_image: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def image_to_audio(request):
    try:
        print("Received image file.")
        # Create directories if they don't exist
        audio_dir = BASE_DIR / "audio_files"
        os.makedirs(audio_dir, exist_ok=True)

        # Retrieve the image file data
        input_image = request.FILES['image_file']
        output_audio = audio_dir / "output_audio.wav"

        # Convert image to audio
        convert.image_to_audio(input_image, output_audio)

        # Read audio file data
        with open(output_audio, "rb") as audio_file:
            audio_data = base64.b64encode(audio_file.read()).decode('utf-8')

        response_data = {
            'type': 'audio',
            'audio': audio_data,
        }

        print("Sending audio data as response.")
        return JsonResponse(response_data, content_type='application/json', status=200)

    except Exception as e:
        print(f"Error in image_to_audio: {e}")
        return JsonResponse({'error': str(e)}, status=500)
