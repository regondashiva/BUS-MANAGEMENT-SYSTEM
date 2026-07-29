# backend/travels/bookings/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Seat, Bus
from datetime import datetime, timedelta

class SeatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.bus_id = self.scope['url_route']['kwargs']['bus_id']
        self.room_group_name = f'bus_{self.bus_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        
        # Send current seat status
        seats = await self.get_seats_status()
        await self.send(text_data=json.dumps({
            'type': 'seat_status',
            'seats': seats
        }))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        seat_id = data.get('seat_id')
        
        if action == 'lock':
            success = await self.lock_seat(seat_id)
            if success:
                # Broadcast seat lock
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'seat_locked',
                        'seat_id': seat_id,
                        'locked': True
                    }
                )
        elif action == 'unlock':
            await self.unlock_seat(seat_id)
            # Broadcast seat unlock
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'seat_unlocked',
                    'seat_id': seat_id
                }
            )

    # Receive message from room group
    async def seat_locked(self, event):
        await self.send(text_data=json.dumps(event))

    async def seat_unlocked(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def get_seats_status(self):
        seats = Seat.objects.filter(bus_id=self.bus_id).values(
            'id', 'seat_number', 'is_booked', 'is_locked', 'seat_type'
        )
        return list(seats)

    @database_sync_to_async
    def lock_seat(self, seat_id):
        seat = Seat.objects.select_for_update().get(id=seat_id)
        if not seat.is_booked and not seat.is_locked:
            seat.is_locked = True
            seat.locked_until = timezone.now() + timedelta(minutes=5)  # Lock for 5 minutes
            seat.save()
            return True
        return False

    @database_sync_to_async
    def unlock_seat(self, seat_id):
        seat = Seat.objects.get(id=seat_id)
        seat.is_locked = False
        seat.locked_until = None
        seat.save()