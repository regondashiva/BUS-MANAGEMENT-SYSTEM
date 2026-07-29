from django.urls import re_path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from bookings import routing as bookings_routing

# WebSocket URL patterns
websocket_urlpatterns = [
    # Add WebSocket URL patterns from your apps here
    re_path(r'^ws/', URLRouter(bookings_routing.websocket_urlpatterns)),
]

# The ProtocolTypeRouter will route WebSocket connections to the URLRouter
application = ProtocolTypeRouter({
    'websocket': AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
