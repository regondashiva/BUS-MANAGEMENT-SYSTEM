from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/bus/(?P<bus_id>\d+)/$', consumers.SeatStatusConsumer.as_asgi()),
]
