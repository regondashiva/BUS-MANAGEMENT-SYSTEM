import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travels.settings')
django.setup()

from django.utils import timezone
from bookings.models import Bus, Seat

def seed_buses():
    print("Seeding 10 Premium Buses & Seat Maps into Database...")
    now = timezone.now()

    sample_buses = [
        {
            "bus_name": "Shreshta Volvo B11R Multi-Axle AC Sleeper",
            "operator": "Shreshta Premium Lines",
            "number": "TS09-EX-9901",
            "bus_type": "ac_sleeper",
            "origin": "Hyderabad",
            "destination": "Bengaluru",
            "departure_time": now + timedelta(days=1, hours=4),
            "arrival_time": now + timedelta(days=1, hours=14),
            "total_seats": 24,
            "available_seats": 24,
            "price": 1150.00,
            "rating": 4.9,
            "review_count": 340,
            "amenities": ["ac", "wifi", "charging", "water", "blanket", "toilet"],
            "driver_name": "Rajesh Kumar",
            "driver_phone": "+91 98765 43210",
            "cancellation_policy": "Full refund up to 12 hours before departure. 50% refund within 4-12 hours."
        },
        {
            "bus_name": "Shreshta Royal Scania Metrolink Multi-Axle",
            "operator": "Shreshta Express",
            "number": "KA01-SC-8822",
            "bus_type": "volvo",
            "origin": "Bengaluru",
            "destination": "Chennai",
            "departure_time": now + timedelta(days=1, hours=2),
            "arrival_time": now + timedelta(days=1, hours=8),
            "total_seats": 28,
            "available_seats": 28,
            "price": 850.00,
            "rating": 4.8,
            "review_count": 215,
            "amenities": ["ac", "charging", "water", "tv", "snacks"],
            "driver_name": "Vikram Singh",
            "driver_phone": "+91 98123 45678",
            "cancellation_policy": "Full refund up to 6 hours before departure."
        },
        {
            "bus_name": "Shreshta BharatBenz Diamond AC Sleeper",
            "operator": "Shreshta Royal Travels",
            "number": "MH04-BB-7733",
            "bus_type": "sleeper",
            "origin": "Mumbai",
            "destination": "Goa",
            "departure_time": now + timedelta(days=1, hours=5),
            "arrival_time": now + timedelta(days=1, hours=16),
            "total_seats": 24,
            "available_seats": 24,
            "price": 1400.00,
            "rating": 4.9,
            "review_count": 480,
            "amenities": ["ac", "wifi", "charging", "water", "blanket", "tv", "snacks"],
            "driver_name": "Ramesh Patil",
            "driver_phone": "+91 97654 32109",
            "cancellation_policy": "Full refund up to 24 hours before departure."
        },
        {
            "bus_name": "Shreshta Mercedes-Benz Super Luxury Seater",
            "operator": "Shreshta Luxury Coach",
            "number": "DL01-MB-6644",
            "bus_type": "luxury",
            "origin": "Delhi",
            "destination": "Jaipur",
            "departure_time": now + timedelta(days=1, hours=1),
            "arrival_time": now + timedelta(days=1, hours=6),
            "total_seats": 24,
            "available_seats": 24,
            "price": 650.00,
            "rating": 4.7,
            "review_count": 190,
            "amenities": ["ac", "charging", "water", "usb"],
            "driver_name": "Suresh Sharma",
            "driver_phone": "+91 99887 76655",
            "cancellation_policy": "Flexible cancellation available."
        },
        {
            "bus_name": "Shreshta InterCity Express Coach",
            "operator": "Shreshta Intercity",
            "number": "AP09-IC-5555",
            "bus_type": "ac_seater",
            "origin": "Vijayawada",
            "destination": "Hyderabad",
            "departure_time": now + timedelta(days=1, hours=8),
            "arrival_time": now + timedelta(days=1, hours=13, minutes=30),
            "total_seats": 28,
            "available_seats": 28,
            "price": 550.00,
            "rating": 4.6,
            "review_count": 160,
            "amenities": ["ac", "charging", "water", "usb"],
            "driver_name": "Venkatesh Rao",
            "driver_phone": "+91 94401 22334",
            "cancellation_policy": "Standard cancellation policy applies."
        },
        {
            "bus_name": "Shreshta Volvo 9600 AC Sleeper",
            "operator": "Shreshta Southern Lines",
            "number": "TN01-VL-4466",
            "bus_type": "ac_sleeper",
            "origin": "Chennai",
            "destination": "Coimbatore",
            "departure_time": now + timedelta(days=1, hours=6),
            "arrival_time": now + timedelta(days=1, hours=14),
            "total_seats": 24,
            "available_seats": 24,
            "price": 950.00,
            "rating": 4.8,
            "review_count": 270,
            "amenities": ["ac", "wifi", "charging", "water", "blanket"],
            "driver_name": "Murali Krishna",
            "driver_phone": "+91 98400 11223",
            "cancellation_policy": "Full refund up to 12 hours before departure."
        },
        {
            "bus_name": "Shreshta Night Queen Sleeper",
            "operator": "Shreshta Western Lines",
            "number": "MH12-NQ-3377",
            "bus_type": "sleeper",
            "origin": "Pune",
            "destination": "Ahmedabad",
            "departure_time": now + timedelta(days=1, hours=4, minutes=15),
            "arrival_time": now + timedelta(days=1, hours=15, minutes=45),
            "total_seats": 24,
            "available_seats": 24,
            "price": 1250.00,
            "rating": 4.7,
            "review_count": 175,
            "amenities": ["ac", "wifi", "charging", "water", "blanket", "toilet"],
            "driver_name": "Ganesh Shinde",
            "driver_phone": "+91 98220 33445",
            "cancellation_policy": "Full refund up to 12 hours before departure."
        },
        {
            "bus_name": "Shreshta Coastal Line Volvo Multi-Axle",
            "operator": "Shreshta Coastal Express",
            "number": "KA19-CL-2288",
            "bus_type": "volvo",
            "origin": "Mangaluru",
            "destination": "Bengaluru",
            "departure_time": now + timedelta(days=1, hours=5, minutes=30),
            "arrival_time": now + timedelta(days=1, hours=13, minutes=30),
            "total_seats": 28,
            "available_seats": 28,
            "price": 900.00,
            "rating": 4.9,
            "review_count": 310,
            "amenities": ["ac", "wifi", "charging", "water", "blanket", "tv"],
            "driver_name": "Shekhar Shetty",
            "driver_phone": "+91 94480 55667",
            "cancellation_policy": "Full refund up to 6 hours before departure."
        },
        {
            "bus_name": "Shreshta Heritage Express AC Seater",
            "operator": "Shreshta Heritage Tours",
            "number": "RJ14-HE-1199",
            "bus_type": "semi_sleeper",
            "origin": "Jaipur",
            "destination": "Udaipur",
            "departure_time": now + timedelta(days=1, hours=2, minutes=45),
            "arrival_time": now + timedelta(days=1, hours=9, minutes=15),
            "total_seats": 24,
            "available_seats": 24,
            "price": 750.00,
            "rating": 4.6,
            "review_count": 130,
            "amenities": ["ac", "charging", "water", "usb"],
            "driver_name": "Mahendra Singh",
            "driver_phone": "+91 98290 66778",
            "cancellation_policy": "Standard cancellation policy applies."
        },
        {
            "bus_name": "Shreshta Grand Luxe Sleeper",
            "operator": "Shreshta Executive Lines",
            "number": "TS07-GL-0010",
            "bus_type": "ac_sleeper",
            "origin": "Hyderabad",
            "destination": "Visakhapatnam",
            "departure_time": now + timedelta(days=1, hours=4, minutes=45),
            "arrival_time": now + timedelta(days=1, hours=15, minutes=15),
            "total_seats": 24,
            "available_seats": 24,
            "price": 1350.00,
            "rating": 4.9,
            "review_count": 420,
            "amenities": ["ac", "wifi", "charging", "water", "blanket", "tv", "snacks", "toilet"],
            "driver_name": "Satyanarayana",
            "driver_phone": "+91 98490 88990",
            "cancellation_policy": "Full refund up to 12 hours before departure."
        }
    ]

    for bdata in sample_buses:
        bus, created = Bus.objects.update_or_create(
            number=bdata["number"],
            defaults=bdata
        )
        status_str = "Created" if created else "Updated"
        print(f"[+] {status_str} bus: {bus.bus_name} (#{bus.number}) - {bus.origin} -> {bus.destination}")

        # Ensure seat layout is created
        if Seat.objects.filter(bus=bus).count() < bus.total_seats:
            Seat.objects.filter(bus=bus).delete()
            total = bus.total_seats
            for i in range(1, total + 1):
                row = (i - 1) // 4 + 1
                col = (i - 1) % 4 + 1
                seat_num = f"S{i}"
                seat_type = 'window' if col in [1, 4] else 'aisle'
                is_women_only = (i in [1, 2, 5, 6])  # Rows 1 & 2 left side reserved for ladies
                Seat.objects.create(
                    bus=bus,
                    seat_number=seat_num,
                    row=row,
                    column=col,
                    seat_type=seat_type,
                    is_women_only=is_women_only
                )
            print(f"   Created {total} interactive seats for {bus.number}")

    print("\n[SUCCESS] Seeding successfully completed! 10 Premium Buses with Seat Maps ready.")

if __name__ == '__main__':
    seed_buses()
