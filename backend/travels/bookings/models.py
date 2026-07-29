# backend/travels/bookings/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import json

class Bus(models.Model):
    BUS_TYPES = (
        ('ac_sleeper', 'AC Sleeper'),
        ('ac_seater', 'AC Seater'),
        ('non_ac_sleeper', 'Non-AC Sleeper'),
        ('non_ac_seater', 'Non-AC Seater',),
        ('volvo', 'Volvo Multi-Axle'),
        ('sleeper', 'Sleeper Coach'),
        ('semi_sleeper', 'Semi-Sleeper'),
        ('luxury', 'Luxury Coach')
    )

    AMENITY_CHOICES = [
        ('ac', 'Air Conditioning'),
        ('charging', 'Charging Ports'),
        ('wifi', 'Free WiFi'),
        ('blanket', 'Blanket & Pillow'),
        ('water', 'Drinking Water'),
        ('tv', 'Entertainment System'),
        ('toilet', 'Onboard Toilet'),
        ('snacks', 'Complimentary Snacks'),
        ('usb', 'USB Ports'),
        ('wheelchair', 'Wheelchair Accessible')
    ]
    
    bus_name = models.CharField(max_length=100)
    operator = models.CharField(max_length=100, blank=True, null=True)
    number = models.CharField(max_length=20, unique=True)
    bus_type = models.CharField(max_length=20, choices=BUS_TYPES)
    origin = models.CharField(max_length=100)
    origin_coords = models.CharField(max_length=50, blank=True, null=True)  # 'lat,lng' format
    destination = models.CharField(max_length=100)
    destination_coords = models.CharField(max_length=50, blank=True, null=True)  # 'lat,lng' format
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    total_seats = models.PositiveIntegerField()
    available_seats = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    rating = models.FloatField(default=0.0)
    review_count = models.IntegerField(default=0)
    amenities = models.JSONField(
        default=list,
        help_text='Example: ["ac", "wifi", "charging", "water", "blanket"]'
    )
    seat_layout = models.JSONField(
        default=dict,
        help_text='Example: {"rows": 4, "cols": 4, "layout": [["1A", "1B", "", "1C"], ["2A", "2B", "", "2C"], ["3A", "3B", "", "3C"], ["4A", "4B", "", "4C"]]}'
    )
    route = models.JSONField(
        default=dict,
        help_text='Example: {"distance": "350 km", "duration": "6h 30m", "waypoints": [{"name": "Bengaluru", "lat": 12.9716, "lng": 77.5946}, {"name": "Chennai", "lat": 13.0827, "lng": 80.2707}]}'
    )
    driver_name = models.CharField(max_length=100, blank=True, null=True, default="Rajesh Kumar")
    driver_phone = models.CharField(max_length=20, blank=True, null=True, default="+91 98765 43210")
    cancellation_policy = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['departure_time']
        verbose_name_plural = 'Buses'
    
    def __str__(self):
        return f"{self.bus_name} - {self.number} ({self.origin} to {self.destination})"
    
    def save(self, *args, **kwargs):
        # Ensure available_seats doesn't exceed total_seats
        if self.available_seats > self.total_seats:
            self.available_seats = self.total_seats
        super().save(*args, **kwargs)
    
    def update_rating(self, new_rating):
        """Update bus rating when a new review is added"""
        if new_rating < 1 or new_rating > 5:
            raise ValueError("Rating must be between 1 and 5")
            
        total_rating = (self.rating * self.review_count) + new_rating
        self.review_count += 1
        self.rating = round(total_rating / self.review_count, 1)
        self.save()
        return self.rating
    
    def get_available_seats(self):
        """Get all available seats for this bus"""
        return self.seats.filter(is_booked=False, is_locked=False)
    
    def get_seat_layout(self):
        """Get the seat layout with current booking status"""
        if not hasattr(self, '_seat_layout'):
            layout = self.seat_layout.copy()
            seats = {seat.seat_number: seat for seat in self.seats.all()}
            
            # Update layout with seat status
            for i, row in enumerate(layout.get('layout', [])):
                for j, seat_num in enumerate(row):
                    if seat_num and seat_num in seats:
                        seat = seats[seat_num]
                        layout['layout'][i][j] = {
                            'number': seat.seat_number,
                            'type': seat.seat_type,
                            'is_booked': seat.is_booked,
                            'is_locked': seat.is_locked,
                            'price_multiplier': seat.price_multiplier
                        }
            self._seat_layout = layout
        return self._seat_layout
    
    def calculate_fare(self, seat_count=1, seat_type=None):
        """Calculate total fare for given number of seats"""
        base_price = float(self.price)
        if seat_type:
            # Apply seat type multiplier if specified
            seat = self.seats.filter(seat_type=seat_type).first()
            if seat:
                base_price *= seat.price_multiplier
        return round(base_price * seat_count, 2)

    def __str__(self):
        return f"{self.bus_name} - {self.number}"

class Seat(models.Model):
    SEAT_TYPES = (
        ('window', 'Window'),
        ('aisle', 'Aisle'),
        ('sleeper', 'Sleeper'),
        ('sleeper_lower', 'Sleeper Lower'),
        ('sleeper_upper', 'Sleeper Upper'),
        ('disabled', 'Disabled'),
        ('premium', 'Premium'),
        ('emergency', 'Emergency Exit')
    )
    
    SEAT_TYPE_MULTIPLIERS = {
        'window': 1.0,
        'aisle': 1.0,
        'sleeper': 1.2,
        'sleeper_lower': 1.3,
        'sleeper_upper': 1.1,
        'premium': 1.5,
        'emergency': 0.9,
        'disabled': 1.0
    }
    
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='seats')
    seat_number = models.CharField(max_length=10)
    seat_type = models.CharField(max_length=15, choices=SEAT_TYPES, default='window')
    is_booked = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    locked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='locked_seats')
    locked_at = models.DateTimeField(null=True, blank=True)
    locked_until = models.DateTimeField(null=True, blank=True)
    row = models.PositiveIntegerField()
    column = models.PositiveIntegerField()
    price_multiplier = models.FloatField(default=1.0)
    is_women_only = models.BooleanField(default=False)  # For ladies' seats
    
    class Meta:
        unique_together = ('bus', 'seat_number')
        ordering = ['row', 'column']
        indexes = [
            models.Index(fields=['bus', 'is_booked']),
            models.Index(fields=['bus', 'is_locked']),
        ]
    
    def __str__(self):
        return f"{self.bus.number} - {self.seat_number} ({self.get_seat_type_display()})"
    
    def save(self, *args, **kwargs):
        # Set default price multiplier based on seat type
        if not self.price_multiplier or self.price_multiplier == 1.0:
            self.price_multiplier = self.SEAT_TYPE_MULTIPLIERS.get(self.seat_type, 1.0)
        super().save(*args, **kwargs)
    
    def lock_seat(self, user, lock_duration=300):
        """
        Lock a seat for a user for a specific duration (default 5 minutes)
        
        Args:
            user: The user who is locking the seat
            lock_duration: Duration in seconds to lock the seat (default: 300s / 5min)
            
        Returns:
            tuple: (success: bool, message: str)
        """
        now = timezone.now()
        
        # Check if seat is already booked
        if self.is_booked:
            return False, "Seat is already booked"
            
        # Check if seat is locked by another user
        if self.is_locked and self.locked_until > now and self.locked_by != user:
            time_left = (self.locked_until - now).seconds // 60
            return False, f"Seat is locked by another user. Available in {time_left} minutes"
            
        # Lock the seat
        self.is_locked = True
        self.locked_by = user
        self.locked_at = now
        self.locked_until = now + timezone.timedelta(seconds=lock_duration)
        self.save()
        
        # Schedule an async task to unlock the seat after the lock duration
        from .tasks import unlock_seat_after_delay
        unlock_seat_after_delay.apply_async(
            args=[self.id],
            countdown=lock_duration
        )
        
        return True, "Seat locked successfully"
    
    def unlock_seat(self, user=None):
        """
        Unlock a seat if the user is the one who locked it
        
        Args:
            user: The user requesting to unlock the seat (optional)
            
        Returns:
            tuple: (success: bool, message: str)
        """
        # If user is provided, check if they're the one who locked it
        if user and self.locked_by != user:
            return False, "You don't have permission to unlock this seat"
            
        # If seat is not locked, return success
        if not self.is_locked:
            return True, "Seat is already unlocked"
            
        # Unlock the seat
        self.is_locked = False
        self.locked_until = None
        self.locked_by = None
        self.locked_at = None
        self.save()
        
        return True, "Seat unlocked successfully"
    
    def is_available(self):
        """Check if the seat is available for booking"""
        now = timezone.now()
        return not self.is_booked and (not self.is_locked or self.locked_until < now)
    
    def __str__(self):
        return f"{self.bus.number} - {self.seat_number}"

class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending Payment'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
        ('refunded', 'Refunded'),
        ('failed', 'Payment Failed'),
        ('expired', 'Expired')
    )
    
    PAYMENT_METHODS = (
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('net_banking', 'Net Banking'),
        ('upi', 'UPI'),
        ('wallet', 'Wallet'),
        ('cod', 'Cash on Board')
    )
    
    CANCELLATION_POLICY = {
        'before_48h': 0.95,  # 95% refund
        'before_24h': 0.85,  # 85% refund
        'before_12h': 0.70,  # 70% refund
        'before_6h': 0.50,   # 50% refund
        'after_6h': 0.10,    # 10% refund
        'after_departure': 0.0  # No refund
    }
    
    # Basic information
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    bus = models.ForeignKey(Bus, on_delete=models.PROTECT, related_name='bookings')
    seats = models.ManyToManyField(Seat, related_name='bookings')
    booking_reference = models.CharField(max_length=10, unique=True, db_index=True, default='TEMP')
    
    # Dates
    booking_date = models.DateTimeField(default=timezone.now)
    journey_date = models.DateField(default=timezone.now)
    cancellation_date = models.DateTimeField(null=True, blank=True)
    
    # Payment information
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, blank=True, null=True)
    payment_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    payment_status = models.CharField(max_length=20, default='pending')
    
    # Status and tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_round_trip = models.BooleanField(default=False)
    return_booking = models.OneToOneField('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='outbound_booking')
    
    # Additional information
    special_requests = models.TextField(blank=True, null=True)
    cancellation_reason = models.TextField(blank=True, null=True)
    
    # Audit fields
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-booking_date']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['booking_reference']),
            models.Index(fields=['payment_id']),
            models.Index(fields=['journey_date', 'status']),
        ]
    
    def __str__(self):
        return f"{self.booking_reference} - {self.user.get_full_name() or self.user.username}"
    
    def save(self, *args, **kwargs):
        if not self.booking_reference:
            self.booking_reference = self.generate_booking_reference()
            
        # Update status based on payment status
        if self.payment_status == 'completed' and self.status == 'pending':
            self.status = 'confirmed'
            
        super().save(*args, **kwargs)
        
        # If this is a confirmed booking, mark seats as booked
        if self.status == 'confirmed':
            self.seats.update(is_booked=True, is_locked=False, locked_until=None, locked_by=None)
    
    def generate_booking_reference(self):
        """Generate a unique booking reference"""
        import random
        import string
        from django.db import IntegrityError
        
        while True:
            # Format: 2 letters + 6 digits (e.g., AB123456)
            ref = (
                random.choice(string.ascii_uppercase) + 
                random.choice(string.ascii_uppercase) +
                ''.join(random.choices(string.digits, k=6))
            )
            
            # Check if reference already exists
            if not Booking.objects.filter(booking_reference=ref).exists():
                return ref
    
    def calculate_refund_amount(self, cancellation_time=None):
        """
        Calculate refund amount based on cancellation time
        
        Args:
            cancellation_time: The time of cancellation (defaults to now)
            
        Returns:
            float: Refund amount
        """
        if cancellation_time is None:
            cancellation_time = timezone.now()
            
        # Calculate hours until departure
        departure_time = datetime.combine(self.journey_date, self.bus.departure_time.time())
        time_until_departure = (departure_time - cancellation_time).total_seconds() / 3600
        
        # Apply cancellation policy
        if time_until_departure > 48:
            refund_percent = self.CANCELLATION_POLICY['before_48h']
        elif time_until_departure > 24:
            refund_percent = self.CANCELLATION_POLICY['before_24h']
        elif time_until_departure > 12:
            refund_percent = self.CANCELLATION_POLICY['before_12h']
        elif time_until_departure > 6:
            refund_percent = self.CANCELLATION_POLICY['before_6h']
        elif time_until_departure > 0:
            refund_percent = self.CANCELLATION_POLICY['after_6h']
        else:
            refund_percent = self.CANCELLATION_POLICY['after_departure']
            
        return round(float(self.total_amount) * refund_percent, 2)
    
    def get_seat_numbers(self):
        """Get a comma-separated string of seat numbers"""
        return ', '.join([seat.seat_number for seat in self.seats.all()])
    
    def get_passenger_count(self):
        """Get the number of passengers (seats) in this booking"""
        return self.seats.count()
    
    def can_cancel(self):
        """Check if this booking can be cancelled"""
        if self.status not in ['confirmed', 'pending']:
            return False
            
        # Check if departure time has passed
        departure_time = datetime.combine(self.journey_date, self.bus.departure_time.time())
        return departure_time > timezone.now()
    
    def cancel(self, reason=''):
        """
        Cancel the booking and process refund
        
        Args:
            reason: Reason for cancellation (optional)
            
        Returns:
            tuple: (success: bool, message: str)
        """
        from django.db import transaction
        
        if self.status not in ['confirmed', 'pending']:
            return False, "Booking cannot be cancelled in its current state"
            
        if not self.can_cancel():
            return False, "This booking can no longer be cancelled"
            
        with transaction.atomic():
            # Update booking status
            self.status = 'cancelled'
            self.cancellation_date = timezone.now()
            self.cancellation_reason = reason
            
            # Calculate and set refund amount
            if self.payment_status == 'completed':
                self.refund_amount = self.calculate_refund_amount()
                self.payment_status = 'refund_pending'
            
            # Save the booking
            self.save()
            
            # Free up the seats
            self.seats.update(is_booked=False, is_locked=False, locked_until=None, locked_by=None)
            
            # Update available seats count
            self.bus.available_seats = self.bus.seats.filter(is_booked=False).count()
            self.bus.save()
            
            # Trigger refund processing asynchronously
            from .tasks import process_refund
            process_refund.delay(self.id)
            
            # Send cancellation email
            from .utils import send_booking_cancellation_email
            send_booking_cancellation_email(self)
            
            return True, "Booking cancelled successfully. Refund will be processed shortly."
    
    def get_absolute_url(self):
        """Get the URL to view this booking"""
        from django.urls import reverse
        return reverse('booking-detail', kwargs={'booking_reference': self.booking_reference})
    
    def get_status_display_with_color(self):
        """Get status with associated color for UI"""
        status_colors = {
            'pending': 'warning',
            'confirmed': 'success',
            'cancelled': 'danger',
            'completed': 'info',
            'refunded': 'info',
            'failed': 'danger',
            'expired': 'secondary'
        }
        return {
            'status': self.get_status_display(),
            'color': status_colors.get(self.status, 'secondary')
        }