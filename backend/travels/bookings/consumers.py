import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import Seat, Bus

class SeatStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.bus_id = self.scope['url_route']['kwargs']['bus_id']
        self.room_group_name = f'bus_{self.bus_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        
        # Send current seat status when a client connects
        await self.send_seat_status()

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
        
        if action == 'lock_seat':
            seat_id = data.get('seat_id')
            user_id = self.scope['user'].id
            success, message = await self.lock_seat(seat_id, user_id)
            
            # Broadcast the seat status update to all clients
            await self.send_seat_status()
            
            # Send confirmation to the requesting client
            await self.send(text_data=json.dumps({
                'type': 'seat_status',
                'seat_id': seat_id,
                'status': 'locked' if success else 'error',
                'message': message
            }))
            
        elif action == 'unlock_seat':
            seat_id = data.get('seat_id')
            user_id = self.scope['user'].id
            success, message = await self.unlock_seat(seat_id, user_id)
            
            # Broadcast the seat status update to all clients
            await self.send_seat_status()
            
            # Send confirmation to the requesting client
            await self.send(text_data=json.dumps({
                'type': 'seat_status',
                'seat_id': seat_id,
                'status': 'unlocked' if success else 'error',
                'message': message
            }))

    async def seat_status_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))
    
    async def send_seat_status(self):
        seats = await self.get_bus_seats()
        
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'seat_status_update',
                'seats': seats
            }
        )
    
    @database_sync_to_async
    def get_bus_seats(self):
        seats = Seat.objects.filter(bus_id=self.bus_id).select_related('locked_by')
        return [{
            'id': seat.id,
            'seat_number': seat.seat_number,
            'seat_type': seat.seat_type,
            'is_booked': seat.is_booked,
            'is_locked': seat.is_locked,
            'locked_until': str(seat.locked_until) if seat.locked_until else None,
            'locked_by': seat.locked_by.username if seat.locked_by else None,
            'row': seat.row,
            'column': seat.column,
            'price_multiplier': float(seat.price_multiplier)
        } for seat in seats]
    
    @database_sync_to_async
    def lock_seat(self, seat_id, user_id):
        try:
            seat = Seat.objects.get(id=seat_id, bus_id=self.bus_id)
            # In a real app, you'd get the user object, here we'll use a simplified version
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.get(id=user_id)
            return seat.lock_seat(user)
        except (Seat.DoesNotExist, User.DoesNotExist):
            return False, "Invalid seat or user"
    
    @database_sync_to_async
    def unlock_seat(self, seat_id, user_id):
        try:
            seat = Seat.objects.get(id=seat_id, bus_id=self.bus_id)
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.get(id=user_id)
            return seat.unlock_seat(user)
        except (Seat.DoesNotExist, User.DoesNotExist):
            return False, "Invalid seat or user"
