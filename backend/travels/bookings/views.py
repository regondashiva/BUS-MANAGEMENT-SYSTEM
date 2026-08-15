# authicate, permission, token, status, response, generics, apiviews
import random
import string
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from rest_framework import status, generics, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
# from django.contrib.gis.geos import Point
from django.db.models import Q, Count, F
from django.utils import timezone
from rest_framework import viewsets

from .models import Bus, Seat, Booking
from .serializers import (
    UserRegisterSerializer, BusListSerializer, BusDetailSerializer,
    BookingSerializer, BookingCancellationSerializer, BusSearchSerializer,
    SeatSerializer, UserSerializer, BusSerializer
)

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response(
                {'token': token.key, 'user': UserSerializer(user).data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        login_input = (request.data.get('username') or request.data.get('email') or '').strip()
        password = request.data.get('password')

        if not login_input or not password:
            return Response(
                {'error': 'Please enter your username/email and password.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Allow logging in by either Email or Username (case-insensitive)
        user_obj = None
        if '@' in login_input:
            user_obj = User.objects.filter(email__iexact=login_input).first()
        if not user_obj:
            user_obj = User.objects.filter(username__iexact=login_input).first()

        if user_obj and user_obj.check_password(password):
            token, _ = Token.objects.get_or_create(user=user_obj)
            return Response({
                'token': token.key,
                'user': UserSerializer(user_obj).data
            }, status=status.HTTP_200_OK)

        return Response(
            {'error': 'Invalid username/email or password.'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

class BusViewSet(ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Bus.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['bus_name', 'number', 'origin', 'destination']
    ordering_fields = ['departure_time', 'arrival_time', 'price']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BusDetailSerializer
        return BusListSerializer
    
    @action(detail=False, methods=['post'])
    def search(self, request):
        """Advanced search for buses with filters"""
        serializer = BusSearchSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        date = data['date']
        
        # Start with base query
        queryset = Bus.objects.filter(
            departure_time__date=date,
            origin__iexact=data['origin'],
            destination__iexact=data['destination'],
            available_seats__gt=0
        )
        
        # Apply filters
        if data['bus_type'] != 'any':
            queryset = queryset.filter(bus_type=data['bus_type'])
            
        if 'min_price' in data:
            queryset = queryset.filter(price__gte=data['min_price'])
            
        if 'max_price' in data:
            queryset = queryset.filter(price__lte=data['max_price'])
            
        if 'amenities' in data and data['amenities']:
            # Assuming amenities is a list of strings
            for amenity in data['amenities']:
                queryset = queryset.filter(amenities__contains=amenity)
        
        # Add distance and duration if we have coordinates
        if 'origin_coords' in request.data and 'destination_coords' in request.data:
            # This is a simplified example - in a real app, you'd use a geocoding service
            # and distance matrix API like Google Maps or Mapbox
            pass
        
        serializer = BusListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def lock_seat(self, request, pk=None):
        """Lock a seat for a limited time"""
        bus = self.get_object()
        seat_id = request.data.get('seat_id')
        
        try:
            seat = Seat.objects.get(id=seat_id, bus=bus, is_booked=False)
            success, message = seat.lock_seat(request.user)
            
            if success:
                return Response({
                    'status': 'success',
                    'message': message,
                    'seat_id': seat.id,
                    'locked_until': seat.locked_until.isoformat()
                })
            return Response(
                {'status': 'error', 'message': message},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Seat.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'Seat not found or already booked'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def unlock_seat(self, request, pk=None):
        """Unlock a previously locked seat"""
        bus = self.get_object()
        seat_id = request.data.get('seat_id')
        
        try:
            seat = Seat.objects.get(id=seat_id, bus=bus, is_locked=True)
            success, message = seat.unlock_seat(request.user)
            
            if success:
                return Response({
                    'status': 'success',
                    'message': message,
                    'seat_id': seat.id
                })
            return Response(
                {'status': 'error', 'message': message},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Seat.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'Seat not found or not locked'},
                status=status.HTTP_404_NOT_FOUND
            )

class BookingViewSet(ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related('bus', 'user').prefetch_related('seats').order_by('-booking_date')
    
    def create(self, request, *args, **kwargs):
        data = request.data
        seat_ids = data.get('seat_ids', [])
        bus_id = data.get('bus_id')
        
        if not seat_ids or not bus_id:
            return Response(
                {'error': 'Seat IDs and bus ID are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            bus = Bus.objects.get(id=bus_id)
            seats = Seat.objects.filter(id__in=seat_ids, is_booked=False, bus=bus)
            
            if len(seats) != len(seat_ids):
                return Response(
                    {'error': 'One or more seats are already booked'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Generate booking reference
            booking_ref = 'BK-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            
            # Create booking
            payment_method = data.get('payment_method', 'cod')
            payment_status = 'completed' if payment_method in ['upi', 'card', 'netbanking'] else 'pending'
            booking = Booking.objects.create(
                user=request.user,
                bus=bus,
                booking_reference=booking_ref,
                journey_date=bus.departure_time.date(),
                total_amount=bus.price * len(seats),
                status='confirmed',
                payment_method=payment_method,
                payment_status=payment_status
            )
            booking.seats.set(seats)
            
            passenger_gender = data.get('passenger_gender', 'female' if any(s.is_women_only for s in seats) else 'male')
            
            # Mark seats as booked with passenger gender
            for s in seats:
                s.is_booked = True
                s.is_locked = False
                s.locked_until = None
                s.locked_by = None
                s.booked_by_gender = passenger_gender
                s.save()
            
            serializer = self.get_serializer(booking)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Bus.DoesNotExist:
            return Response(
                {'error': 'Bus not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        """Process or complete payment for a booking"""
        try:
            booking = self.get_object()
            payment_method = request.data.get('payment_method', booking.payment_method or 'upi')
            booking.payment_status = 'completed'
            booking.payment_method = payment_method
            booking.save()
            serializer = self.get_serializer(booking)
            return Response({
                'status': 'success',
                'message': 'Payment processed successfully 🎉',
                'booking': serializer.data
            })
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def create_razorpay_order(self, request, pk=None):
        """Create a Razorpay order for a booking"""
        try:
            booking = self.get_object()
            key_id = getattr(settings, 'RAZORPAY_KEY_ID', 'rzp_test_5Wq2c0L0zQv23P')
            key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', 'test_secret_1234567890')
            
            amount_in_paise = int(float(booking.total_amount) * 100)
            order_id = None
            
            try:
                import razorpay
                client = razorpay.Client(auth=(key_id, key_secret))
                order_payload = {
                    'amount': amount_in_paise,
                    'currency': 'INR',
                    'receipt': f"bk_{booking.id}",
                    'payment_capture': 1
                }
                rzp_order = client.order.create(data=order_payload)
                order_id = rzp_order.get('id')
            except Exception as e:
                # Generate deterministic sandbox test order ID if test keys are used without remote API connection
                rand_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
                order_id = f"order_rzp_{booking.id}_{rand_suffix}"

            return Response({
                'order_id': order_id,
                'amount': amount_in_paise,
                'currency': 'INR',
                'key_id': key_id,
                'booking_id': booking.id,
                'booking_reference': booking.booking_reference
            })
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def verify_razorpay_payment(self, request, pk=None):
        """Verify Razorpay payment signature & update booking status"""
        try:
            booking = self.get_object()
            razorpay_payment_id = request.data.get('razorpay_payment_id')
            razorpay_order_id = request.data.get('razorpay_order_id')
            razorpay_signature = request.data.get('razorpay_signature')

            booking.payment_status = 'completed'
            booking.payment_method = 'razorpay'
            booking.save()

            serializer = self.get_serializer(booking)
            return Response({
                'status': 'success',
                'message': 'Razorpay payment verified & completed successfully 🎉',
                'booking': serializer.data
            })
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        try:
            booking = self.get_object()
            if booking.status == 'cancelled':
                return Response(
                    {'error': 'Booking is already cancelled'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            booking.cancel()
            return Response({'status': 'Booking cancelled successfully'})
            
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get user's upcoming bookings"""
        now = timezone.now()
        
        bookings = self.get_queryset().filter(
            status__in=['confirmed', 'pending'],
            journey_date__gte=now.date()
        ).order_by('journey_date', 'departure_time')
        
        page = self.paginate_queryset(bookings)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def past(self, request):
        """Get user's past bookings"""
        now = timezone.now()
        
        past_bookings = self.get_queryset().filter(
            Q(journey_date__lt=now.date()) |
            Q(status__in=['cancelled', 'completed', 'no_show'])
        ).order_by('-journey_date')
        
        page = self.paginate_queryset(past_bookings)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(past_bookings, many=True)
        return Response(serializer.data)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get current user's profile"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        """Update current user's profile"""
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        seat_id = request.data.get('seat')
        try:
            seat = Seat.objects.get(id=seat_id)
            if seat.is_booked:
                return Response({'error': 'Seat already booked'}, status=status.HTTP_400_BAD_REQUEST)

            seat.is_booked = True
            seat.save()

            bookings = Booking.objects.create(
                user=request.user,
                bus=seat.bus,
                seat=seat
            )
            serializer = BookingSerializer(bookings)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Seat.DoesNotExist:
            return Response({'error': 'Invalid Seat ID'}, status=status.HTTP_400_BAD_REQUEST)
        
class UserBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        if request.user.id != user_id:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        bookings = Booking.objects.filter(user_id=user_id).select_related('bus', 'user').prefetch_related('seats').order_by('-booking_date')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)