"""
ASGI config for Social_Network project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Social_Network.settings')

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

from chat_app.routing import websocket_urlpatterns as chat_websocket_urlpatterns
from user_app.routing import websocket_urlpatterns as user_websocket_urlpatterns


# application = get_asgi_application()
application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(chat_websocket_urlpatterns + user_websocket_urlpatterns)
    ),
})