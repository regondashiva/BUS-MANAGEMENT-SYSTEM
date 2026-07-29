from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, LoginView, UserProfileView,
    BusViewSet, BookingViewSet, UserBookingView
)

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'buses', BusViewSet, basename='bus')
router.register(r'bookings', BookingViewSet, basename='booking')

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('user/<int:user_id>/bookings/', UserBookingView.as_view(), name='user-bookings'),
]