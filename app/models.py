from django.db import models
import uuid

# Image Upload Model


class ImageUpload(models.Model):
    image = models.ImageField(upload_to="img/%y")

    def __str__(self):
        return self.image.name

# Audio Upload Model


class AudioUpload(models.Model):
    audio = models.FileField(upload_to="audio/%y")

    def __str__(self):
        return self.audio.name
# Conversion Session Model


class ConversionSession(models.Model):
    CONVERSION_TYPES = [
        ('audio_to_image', 'Audio to Image'),
        ('image_to_audio', 'Image to Audio'),
    ]

    session_id = models.UUIDField(default=uuid.uuid4, editable=False)
    conversion_type = models.CharField(max_length=20, choices=CONVERSION_TYPES)
    input_file = models.FileField(upload_to='uploads/')
    description_prompt = models.TextField(blank=True, null=True)
    output_file = models.FileField(upload_to='outputs/', blank=True, null=True)
    ai_model_used = models.CharField(max_length=50, blank=True)
    processing_status = models.CharField(max_length=20, default='pending')
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.conversion_type} - {self.session_id}"

# Audio Recording Model


class AudioRecording(models.Model):
    session = models.ForeignKey(
        ConversionSession, on_delete=models.CASCADE, related_name='recordings')
    audio_data = models.BinaryField()
    duration = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Recording for {self.session.session_id}"
