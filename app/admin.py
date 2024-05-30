from django.contrib import admin
from .models import ImageUpload, AudioUpload

# Register your models here.
admin.site.register(ImageUpload)
admin.site.register(AudioUpload)