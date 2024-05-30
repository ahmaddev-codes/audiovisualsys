import librosa
import matplotlib
import matplotlib.pyplot as plt
from PIL import Image
import soundfile as sf
import numpy as np

def audio_to_image(audio_path, image_path):
    # Read audio file
    y, sr = librosa.load(audio_path)

    # Extract features (Mel spectrogram)
    S = librosa.feature.melspectrogram(y=y, sr=sr)
    log_S = librosa.power_to_db(S, ref=np.max)

    matplotlib.use('Agg')  # Use the Agg backend (non-GUI)
    # Plot and save as image
    plt.figure(figsize=(14, 5))
    librosa.display.specshow(log_S, sr=sr)
    plt.title('Audio spectrogram')
    plt.savefig(image_path)
    plt.close()

def image_to_audio(image_path, audio_path):
    # Read image file
    img = Image.open(image_path)
    # Calculate the number of samples needed for the desired duration
    sample_rate = 44100
    duration = 10  # seconds
    num_samples = sample_rate * duration
    # Resize image to match the desired duration
    img = img.resize((int(num_samples / img.size[1]), int(num_samples / img.size[1])))
    # Convert image to grayscale
    img_gray = img.convert('L')
    # Convert image data to audio waveform
    samples = np.array(img_gray.getdata()) / 255.0 * 2 - 1
    # Trim or pad the samples to ensure the exact duration
    if len(samples) > num_samples:
        samples = samples[:num_samples]
    else:
        samples = np.pad(samples, (0, num_samples - len(samples)), mode='constant')
    # Save audio file
    sf.write(audio_path, samples, sample_rate)
