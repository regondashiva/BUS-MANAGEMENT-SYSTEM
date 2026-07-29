
from django.contrib import admin
from .models import Bus, Seat, Booking


class BusAdmin(admin.ModelAdmin):
    list_display = ('bus_name', 'number', 'origin', 'destination', 'departure_time', 'arrival_time', 'price', 'driver_name', 'driver_phone')

class SeatAdmin(admin.ModelAdmin):
    list_display = ('seat_number', 'bus', 'is_booked', 'is_locked')

class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'bus', 'booking_reference', 'booking_date', 'journey_date', 'total_amount', 'status')

admin.site.register(Bus, BusAdmin)
admin.site.register(Seat, SeatAdmin)
admin.site.register(Booking, BookingAdmin)

