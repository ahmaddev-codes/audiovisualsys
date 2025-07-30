from django.contrib import admin
from .models import ImageUpload, AudioUpload, ConversionSession, AudioRecording

# Register your models here.
admin.site.register(ImageUpload)
admin.site.register(AudioUpload)

@admin.register(ConversionSession)
class ConversionSessionAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'conversion_type', 'processing_status', 'created_at', 'completed_at')
    list_filter = ('conversion_type', 'processing_status', 'created_at')
    search_fields = ('session_id', 'description_prompt')
    readonly_fields = ('session_id', 'created_at', 'completed_at')
    ordering = ('-created_at',)

@admin.register(AudioRecording)
class AudioRecordingAdmin(admin.ModelAdmin):
    list_display = ('session', 'duration', 'created_at')
    list_filter = ('created_at',)
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)