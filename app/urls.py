from django.urls import path
from . import views

# Specify the namespace for your app
app_name = 'homepage'

urlpatterns = [
    path('', views.homepage, name='homepage'),
    # Add more URL patterns as needed
]
