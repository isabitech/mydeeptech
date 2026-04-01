import { baseURL } from '../store/api/endpoints';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HubstaffUpdate {
  type: 'TIMER_UPDATE' | 'session-started' | 'session-ended';
  deviceId?: string;
  userId?: string;
  userName?: string;
  deviceName?: string;
  duration?: string;
  activeSessions?: any[];
  timestamp: string;
}

export type HubstaffEventType = 'timer-update' | 'session-start' | 'session-end' | 'connection-status';

export interface HubstaffEventCallback {
  (data: HubstaffUpdate | { connected: boolean }): void;
}

// ─── WebSocket Service ────────────────────────────────────────────────────────

class HubstaffRealtimeService {
  private ws: WebSocket | null = null;
  private listeners: Map<HubstaffEventType, HubstaffEventCallback[]> = new Map();
  private userToken: string;
  private isAdmin: boolean;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private isConnected = false;

  constructor(userToken: string, isAdmin = false) {
    this.userToken = userToken;
    this.isAdmin = isAdmin;
  }

  // ─── Connection Management ────────────────────────────────────────────────────
  connect() {
    try {
      // Convert HTTP/HTTPS base URL to WebSocket URL
      const wsBaseUrl = baseURL?.replace(/^https?:\/\//, '') || 'localhost:4000';
      const protocol = baseURL?.startsWith('https') ? 'wss' : 'ws';
      const wsUrl = `${protocol}://${wsBaseUrl}/hubstaff-updates`;
      
      console.log('🔗 Connecting to Hubstaff WebSocket:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ Hubstaff WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Send authentication and room join
        this.authenticate();
        
        this.emit('connection-status', { connected: true });
      };
      
      this.ws.onmessage = (event) => {
        try {
          const update: HubstaffUpdate = JSON.parse(event.data);
          console.log('📨 Hubstaff update received:', update);
          this.handleUpdate(update);
        } catch (error) {
          console.error('❌ Error parsing Hubstaff WebSocket message:', error);
        }
      };
      
      this.ws.onclose = (event) => {
        console.log('🔌 Hubstaff WebSocket disconnected:', event.reason);
        this.isConnected = false;
        this.emit('connection-status', { connected: false });
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => this.connect(), this.reconnectInterval);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('❌ Hubstaff WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
    }
  }

  private authenticate() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    
    const authMessage = {
      type: this.isAdmin ? 'join-admin' : 'join-user',
      token: this.userToken,
      ...(this.isAdmin ? { isAdmin: true } : {}),
      ...(this.userToken && !this.isAdmin ? { userId: this.getUserId() } : {}),
    };
    
    console.log('🔐 Authenticating with Hubstaff WebSocket:', { type: authMessage.type, isAdmin: this.isAdmin });
    this.ws.send(JSON.stringify(authMessage));
  }

  private getUserId(): string {
    // Extract user ID from token or return a placeholder
    try {
      const payload = JSON.parse(atob(this.userToken.split('.')[1]));
      return payload.userId || payload.id || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  // ─── Event Handling ───────────────────────────────────────────────────────────
  private handleUpdate(update: HubstaffUpdate) {
    const { type } = update;
    
    switch (type) {
      case 'TIMER_UPDATE':
        this.emit('timer-update', update);
        break;
      case 'session-started':
        this.emit('session-start', update);
        break;
      case 'session-ended':
        this.emit('session-end', update);
        break;
      default:
        console.log('📝 Unknown Hubstaff update type:', type);
    }
  }

  // ─── Event Listeners ──────────────────────────────────────────────────────────
  on(event: HubstaffEventType, callback: HubstaffEventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: HubstaffEventType, callback: HubstaffEventCallback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: HubstaffEventType, data: any) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`❌ Error in Hubstaff event callback for ${event}:`, error);
      }
    });
  }

  // ─── Connection Status ────────────────────────────────────────────────────────
  isConnectedStatus(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  disconnect() {
    if (this.ws) {
      console.log('🔌 Manually disconnecting Hubstaff WebSocket');
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.listeners.clear();
  }

  // ─── Manual Reconnect ─────────────────────────────────────────────────────────
  forceReconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    setTimeout(() => this.connect(), 1000);
  }
}

// ─── Service Factory ──────────────────────────────────────────────────────────

export const createHubstaffRealtimeService = (userToken: string, isAdmin = false): HubstaffRealtimeService => {
  return new HubstaffRealtimeService(userToken, isAdmin);
};

export default HubstaffRealtimeService;