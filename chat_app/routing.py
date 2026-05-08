"""
    Файл для налаштування маршрутизації WebSocket-з`єднань.
    Цей файл є аналогом urls.py і працює в асинхронному режимі. 
    В цьому файлі ми створюємо url-адреси для WebSocket-з`єднань.
"""
from django.urls import path
from .consumers import ChatConsumer

websocket_urlpatterns = [
    path('chat/', ChatConsumer.as_asgi()) # type: ignore
]