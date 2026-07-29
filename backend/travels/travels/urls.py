from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('', lambda request: HttpResponse("Welcome to the Travels API Home 🚀")),
    path('admin/', admin.site.urls),
    path('api-token-auth/', obtain_auth_token),
    path('api/', include('bookings.urls')),
    path('api-auth/', include('rest_framework.urls')),
]
