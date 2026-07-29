# backend/travels/bookings/serializers.py
from rest_framework import serializers
from .models import Bus, Seat, Booking, User
# from django.contrib.gis.geos import Point
import json
from django.utils import timezone

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']
        read_only_fields = ['id']

class SeatSerializer(serializers.ModelSerializer):
    locked_by = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    
    class Meta:
        model = Seat
        fields = [
            'id', 'seat_number', 'seat_type', 'is_booked', 'is_locked', 
            'row', 'column', 'price_multiplier', 'locked_by', 'price'
        ]
        read_only_fields = ['id', 'is_booked', 'is_locked', 'locked_by']
    
    def get_locked_by(self, obj):
        if obj.locked_by and obj.locked_until and obj.locked_until > timezone.now():
            return obj.locked_by.username
        return None
    
    def get_price(self, obj):
        return float(obj.bus.price) * float(obj.price_multiplier)

class BusListSerializer(serializers.ModelSerializer):
    available_seats = serializers.IntegerField(read_only=True)
    departure_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M')
    arrival_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M')
    
    class Meta:
        model = Bus
        fields = [
            'id', 'bus_name', 'number', 'bus_type', 'origin', 'destination',
            'departure_time', 'arrival_time', 'price', 'available_seats',
            'amenities', 'rating', 'review_count', 'route', 'driver_name',
            'driver_phone'
        ]

class BusDetailSerializer(BusListSerializer):
    seats = SeatSerializer(many=True, read_only=True)
    route = serializers.SerializerMethodField()
    
    class Meta(BusListSerializer.Meta):
        fields = BusListSerializer.Meta.fields + ['seats', 'route', 'seat_layout']
    
    def get_route(self, obj):
        return obj.route if obj.route else {}

class BookingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    bus = BusListSerializer(read_only=True)
    seats = SeatSerializer(many=True, read_only=True)
    status = serializers.ChoiceField(choices=Booking.STATUS_CHOICES, read_only=True)
    booking_date = serializers.DateTimeField(format='%Y-%m-%d %H:%M', read_only=True)
    cancellation_date = serializers.DateTimeField(format='%Y-%m-%d %H:%M', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'booking_reference', 'user', 'bus', 'seats', 'status',
            'booking_date', 'journey_date', 'total_amount', 'cancellation_date',
            'refund_amount', 'payment_method', 'payment_status'
        ]
        read_only_fields = ['booking_reference', 'total_amount', 'refund_amount', 'payment_status']
    
    def create(self, validated_data):
        # Get the seat IDs from the request
        seat_ids = self.context['request'].data.get('seat_ids', [])
        if not seat_ids:
            raise serializers.ValidationError("At least one seat must be selected")
        
        # Get the seats and check if they're available
        seats = Seat.objects.filter(id__in=seat_ids, is_booked=False)
        if len(seats) != len(seat_ids):
            raise serializers.ValidationError("One or more seats are already booked")
        
        # Calculate total amount
        bus = seats.first().bus
        total_amount = sum(seat.bus.price * seat.price_multiplier for seat in seats)
        
        # Create the booking
        booking = Booking.objects.create(
            user=self.context['request'].user,
            bus=bus,
            journey_date=validated_data['journey_date'],
            total_amount=total_amount
        )
        
        # Add seats to the booking
        booking.seats.set(seats)
        
        # Mark seats as booked
        seats.update(is_booked=True)
        
        # Update available seats count
        bus.available_seats = bus.seats.filter(is_booked=False).count()
        bus.save()
        
        return booking

class BookingCancellationSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    
    def validate_booking_id(self, value):
        try:
            booking = Booking.objects.get(id=value, user=self.context['request'].user)
            if booking.status != 'confirmed':
                raise serializers.ValidationError("Only confirmed bookings can be cancelled")
            return booking
        except Booking.DoesNotExist:
            raise serializers.ValidationError("Booking not found")

class BusSearchSerializer(serializers.Serializer):
    origin = serializers.CharField(required=True)
    destination = serializers.CharField(required=True)
    date = serializers.DateField(required=True)
    bus_type = serializers.ChoiceField(
        choices=Bus.BUS_TYPES + (('any', 'Any'),),
        required=False,
        default='any'
    )
    min_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, min_value=0, required=False
    )
    max_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, min_value=0, required=False
    )
    amenities = serializers.ListField(
        child=serializers.CharField(), required=False
    )
    
    def validate(self, data):
        if 'min_price' in data and 'max_price' in data:
            if data['min_price'] > data['max_price']:
                raise serializers.ValidationError(
                    "Minimum price cannot be greater than maximum price"
                )
        return data

class BusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = '__all__'