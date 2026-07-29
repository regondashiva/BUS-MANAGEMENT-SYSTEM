class WebSocketService {
  static instance = null;
  callbacks = {};
  reconnectAttempts = 0;
  maxReconnectAttempts = 5;
  reconnectDelay = 3000; // 3 seconds
  
  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(busId) {
    const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${wsScheme}://${window.location.host}/ws/bus/${busId}/`;
    
    this.socket = new WebSocket(wsUrl);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
    };
    
    this.socket.onmessage = (e) => {
      this.socketNewMessage(e.data);
    };
    
    this.socket.onclose = (e) => {
      console.log('WebSocket closed. Attempting to reconnect...');
      this.attemptReconnect(busId);
    };
    
    this.socket.onerror = (err) => {
      console.error('WebSocket error:', err);
      this.socket.close();
    };
  }
  
  attemptReconnect(busId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts} of ${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect(busId);
      }, this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached. Please refresh the page.');
    }
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
  
  socketNewMessage(data) {
    const parsedData = JSON.parse(data);
    const { type, ...rest } = parsedData;
    
    if (Object.prototype.hasOwnProperty.call(this.callbacks, type)) {
      this.callbacks[type](rest);
    }
  }
  
  addCallback(type, callback) {
    this.callbacks[type] = callback;
  }
  
  removeCallback(type) {
    delete this.callbacks[type];
  }
  
  sendMessage(data) {
    try {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(data));
        return true;
      } else {
        console.error('WebSocket is not connected');
        return false;
      }
    } catch (err) {
      console.error('Error sending WebSocket message:', err);
      return false;
    }
  }
  
  // Specific methods for seat operations
  lockSeat(busId, seatId, userId) {
    return this.sendMessage({
      type: 'lock_seat',
      bus_id: busId,
      seat_id: seatId,
      user_id: userId
    });
  }
  
  unlockSeat(busId, seatId, userId) {
    return this.sendMessage({
      type: 'unlock_seat',
      bus_id: busId,
      seat_id: seatId,
      user_id: userId
    });
  }
  
  // Subscribe to seat status updates
  subscribeToSeatUpdates(callback) {
    this.addCallback('seat_status_update', callback);
  }
  
  unsubscribeFromSeatUpdates() {
    this.removeCallback('seat_status_update');
  }
}

export default WebSocketService.getInstance();
