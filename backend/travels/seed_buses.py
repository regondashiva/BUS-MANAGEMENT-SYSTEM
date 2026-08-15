import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travels.settings')
django.setup()

from django.utils import timezone
from bookings.models import Bus, Seat

def seed():
    print("Seeding sample buses and seats...")
    now = timezone.now()

    sample_buses = [
        {
            "bus_name": "Shreshta Travels Express",
            "number": "TS09-AB-1234",
            "bus_type": "ac_sleeper",
            "origin": "Hyderabad",
            "destination": "Bengaluru",
            "departure_time": now + timedelta(days=1, hours=6),
            "arrival_time": now + timedelta(days=1, hours=14),
            "total_seats": 24,
            "available_seats": 24,
            "price": 950.00,
            "rating": 4.8,
            "review_count": 142,
            "amenities": ["ac", "wifi", "charging", "water", "blanket"],
            "driver_name": "Rajesh Kumar",
            "driver_phone": "+91 98765 43210"
        },
        {
            "bus_name": "Shreshta Volvo Multi-Axle",
            "number": "KA01-VX-9988",
            "bus_type": "volvo",
            "origin": "Bengaluru",
            "destination": "Chennai",
            "departure_time": now + timedelta(days=1, hours=8),
            "arrival_time": now + timedelta(days=1, hours=14),
            "total_seats": 28,
            "available_seats": 28,
            "price": 850.00,
            "rating": 4.7,
            "review_count": 98,
            "amenities": ["ac", "charging", "water", "tv", "snacks"],
            "driver_name": "Vikram Singh",
            "driver_phone": "+91 98123 45678"
        },
        {
            "bus_name": "Shreshta Royal Sleeper",
            "number": "MH04-RS-5544",
            "bus_type": "sleeper",
            "origin": "Mumbai",
            "destination": "Goa",
            "departure_time": now + timedelta(days=2, hours=4),
            "arrival_time": now + timedelta(days=2, hours=15),
            "total_seats": 20,
            "available_seats": 20,
            "price": 1200.00,
            "rating": 4.9,
            "review_count": 210,
            "amenities": ["ac", "wifi", "charging", "water", "toilet", "blanket"],
            "driver_name": "Ramesh Patil",
            "driver_phone": "+91 97654 32109"
        },
        {
            "bus_name": "Shreshta Luxury Seater",
            "number": "DL01-LX-7711",
            "bus_type": "luxury",
            "origin": "Delhi",
            "destination": "Jaipur",
            "departure_time": now + timedelta(days=1, hours=2),
            "arrival_time": now + timedelta(days=1, hours=7),
            "total_seats": 24,
            "available_seats": 24,
            "price": 650.00,
            "rating": 4.6,
            "review_count": 85,
            "amenities": ["ac", "charging", "water", "usb"],
            "driver_name": "Suresh Sharma",
            "driver_phone": "+91 99887 76655"
        }
    ]

    for bdata in sample_buses:
        bus, created = Bus.objects.get_or_create(
            number=bdata["number"],
            defaults=bdata
        )
        if created:
            print(f"Created bus: {bus.bus_name} (#{bus.number})")
            # Create seats for bus
            total = bus.total_seats
            for i in range(1, total + 1):
                row = (i - 1) // 4 + 1
                col = (i - 1) % 4 + 1
                seat_num = f"{row}{chr(64 + col)}"
                seat_type = 'window' if col in [1, 4] else 'aisle'
                is_women_only = (i in [1, 2]) # Make first row reserved for ladies as example
                Seat.objects.create(
                    bus=bus,
                    seat_number=seat_num,
                    row=row,
                    column=col,
                    seat_type=seat_type,
                    is_women_only=is_women_only
                )
            print(f"Created {total} seats for {bus.number}")
        else:
            print(f"Bus already exists: {bus.bus_name}")

if __name__ == '__main__':
    seed()
