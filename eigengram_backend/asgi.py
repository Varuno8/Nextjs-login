
"""
ASGI config for eigengram_backend project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eigengram_backend.settings')

application = get_asgi_application()
