from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Bus, Seat

@receiver(post_save, sender=Bus)
def create_seats_for_bus(sender, instance, created, **kwargs):
    if created:
        # Create a simple seat layout (assuming 4 seats per row)
        seats_per_row = 4
        total_seats = instance.total_seats
        rows_needed = (total_seats + seats_per_row - 1) // seats_per_row
        
        seat_num = 1
        for row in range(1, rows_needed + 1):
            for col in range(1, seats_per_row + 1):
                if seat_num > total_seats:
                    break
                Seat.objects.create(
                    bus=instance, 
                    seat_number=f"S{seat_num}",
                    row=row,
                    column=col
                )
                seat_num += 1