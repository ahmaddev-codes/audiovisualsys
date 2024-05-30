# middleware.py

import logging
from django.http import JsonResponse

logger = logging.getLogger(__name__)

class CustomExceptionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        logger.error(f"Exception: {str(exception)}", exc_info=True)
        return JsonResponse({'error': 'An internal error occurred. Please try again later.'}, status=500)
