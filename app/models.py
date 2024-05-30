from django.db import models

# Create your models here.
class ImageUpload(models.Model):
    image = models.ImageField(upload_to="img/%y")

    def __str__(self):
        return self.image.name

class AudioUpload(models.Model):
    audio = models.FileField(upload_to="audio/%y")

    def __str__(self):
        return self.audio.name