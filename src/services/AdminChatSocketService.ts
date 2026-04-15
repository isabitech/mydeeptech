// Admin Chat Socket Service for Admin real-time communication
import { io, Socket } from 'socket.io-client';
import { ChatMessage, ChatTicket } from '../types/enhanced-chat.types';

class AdminChatSocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor() {
    // Initialize any required setup
  }

  // Admin connection with proper configuration
  async connect(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Try multiple URLs in order of preference
      const urls = [
        import.meta.env.VITE_SOCKET_URL,
        'http://localhost:4000',
        'https://mydeeptech-be.onrender.com',
        'https://mydeeptech-be-lmrk.onrender.com'
      ].filter(Boolean);
      
      const url = urls[0] || 'http://localhost:4000';
      console.log('🔌 [AdminChatSocket] Attempting connection to:', url);
      
      // Emit initial connecting status
      this.emit('connection_status', { connected: false, status: 'connecting' });
      
      this.socket = io(url, {
        auth: { token },
        query: { userType: 'admin' },
        transports: ['polling', 'websocket'], // Try polling first for better compatibility
        timeout: 20000, // Increased timeout
        reconnectionDelay: 1000,
        reconnectionDelayMax: 3000,
        reconnectionAttempts: this.maxReconnectAttempts,
        randomizationFactor: 0.3,
        autoConnect: false,
        forceNew: true, // Force new connection
      });

      this.setupEventListeners();
      this.setupReconnectionLogic();

      // Connection timeout fallback - 25 seconds
      const connectionTimeout = setTimeout(() => {
        if (!this.isConnected) {
          console.error('❌ [AdminChatSocket] Connection timeout after 25 seconds');
          this.emit('connection_status', { 
            connected: false, 
            status: 'timeout',
            error: `Could not connect to ${url}. Please check if the server is running.`
          });
          this.socket?.disconnect();
          reject(new Error(`Admin connection timeout to ${url}`));
        }
      }, 25000);

      // Connection success
      this.socket.on('connect', () => {
        clearTimeout(connectionTimeout);
        console.log('✅ [AdminChatSocket] Successfully connected as admin');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connection_status', { connected: true, status: 'connected' });
        
        // Join admin room immediately upon connection
        console.log('🏠 [AdminChatSocket] Joining admin room...');
        this.socket?.emit('join_admin_room');
        resolve(true);
      });

      this.socket.on('connect_error', (error: any) => {
        console.error('❌ [AdminChatSocket] Connection failed:', error);
        this.reconnectAttempts++;
        
        const isServerDown = error.message?.includes('404') || 
                           error.message?.includes('502') || 
                           (error as any).type === 'TransportError';
        
        this.emit('connection_status', { 
          connected: false, 
          status: isServerDown ? 'server_down' : 'error', 
          error: isServerDown ? 'Server appears to be offline' : error.message 
        });
        
        this.emit('connection_error', { error, attempts: this.reconnectAttempts });
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          clearTimeout(connectionTimeout);
          this.emit('connection_status', { 
            connected: false, 
            status: 'failed',
            error: `Failed to connect after ${this.maxReconnectAttempts} attempts` 
          });
          reject(new Error(`Maximum admin connection attempts reached. Last error: ${error.message}`));
        }
      });

      // Start connection
      this.socket.connect();
    });
  }

  // Setup admin-specific event listeners
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️ [AdminChatSocket] Disconnected:', reason);
      this.isConnected = false;
      this.emit('connection_status', { connected: false, reason, status: 'disconnected' });
    });

    this.socket.on('reconnecting', (attemptNumber) => {
      console.log('🔄 [AdminChatSocket] Reconnecting attempt:', attemptNumber);
      this.emit('connection_status', { connected: false, status: 'reconnecting', attempt: attemptNumber });
    });

    // Admin-specific events
    this.socket.on('new_chat_ticket', (data) => {
      this.emit('new_chat_ticket', data);
    });

    this.socket.on('user_message', (data) => {
      console.log('📨 [AdminChatSocket] Received user_message:', data);
      this.emit('user_message', data);
    });

    // Handle all messages for real-time sync
    this.socket.on('new_message', (data) => {
      console.log('💬 [AdminChatSocket] Received new_message:', data);
      this.emit('new_message', data);
    });

    this.socket.on('message_sent', (data) => {

      this.emit('message_sent', data);
    });

    this.socket.on('message_send_success', (data) => {

      this.emit('message_send_success', data);
    });

    this.socket.on('message_send_error', (data) => {
      console.error('❌ [AdminChatSocket] Message send error:', data);
      this.emit('message_send_error', data);
    });

    this.socket.on('chat_closed', (data) => {

      this.emit('chat_closed', data);
    });

    this.socket.on('ticket_status_updated', (data) => {

      this.emit('ticket_status_updated', data);
    });

    this.socket.on('user_typing', (data) => {

      this.emit('user_typing', data);
    });

    this.socket.on('error', (error) => {
      console.error('❌ [AdminChatSocket] Socket.IO error:', error);
      this.emit('socket_error', error);
    });

    this.socket.on('chat_error', (data) => {
      console.error('❌ [AdminChatSocket] Chat error received:', data);
      this.emit('chat_error', data);
    });
  }

  // Reconnection logic
  private setupReconnectionLogic() {
    if (!this.socket) return;

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('✅ [AdminChatSocket] Reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      // Rejoin admin room after reconnection
      this.socket?.emit('join_admin_room');
      this.emit('connection_status', { connected: true, status: 'connected' });
      this.emit('reconnected', { attempts: attemptNumber });
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ [AdminChatSocket] Admin reconnection failed');
      this.emit('connection_status', { connected: false, status: 'failed' });
      this.emit('reconnection_failed', { attempts: this.maxReconnectAttempts });
    });
  }

  // Admin room management
  joinAdminRoom() {
    if (this.isConnected && this.socket) {

      this.socket.emit('join_admin_room');
    }
  }

  // Join specific chat ticket as admin
  joinChatRoom(ticketId: string) {
    if (this.isConnected && this.socket) {

      this.socket.emit('join_ticket', { ticketId });
    } else {
      console.error('❌ [AdminChatSocket] Cannot join chat room: Not connected');
    }
  }

  // Admin message sending
  sendMessage(ticketId: string, message: string, attachments: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected || !this.socket) {
        const error = 'Admin socket not connected';
        console.error('❌ [AdminChatSocket] Cannot send message:', error);
        reject(new Error(error));
        return;
      }


      
      // Set up one-time listeners for this message
      const messageId = `${ticketId}_${Date.now()}`;
      
      const onSuccess = (data: any) => {

        this.socket?.off('message_send_success', onSuccess);
        this.socket?.off('message_send_error', onError);
        resolve();
      };
      
      const onError = (error: any) => {
        console.error('❌ [AdminChatSocket] Message send failed:', error);
        this.socket?.off('message_send_success', onSuccess);
        this.socket?.off('message_send_error', onError);
        reject(new Error(error.message || 'Failed to send admin message'));
      };
      
      // Listen for response
      this.socket.once('message_send_success', onSuccess);
      this.socket.once('message_send_error', onError);
      
      // Set timeout for message sending
      setTimeout(() => {
        this.socket?.off('message_send_success', onSuccess);
        this.socket?.off('message_send_error', onError);
        reject(new Error('Message send timeout'));
      }, 10000);
      
      // Send the message with messageId for tracking
      this.socket.emit('send_message', {
        ticketId,
        message,
        attachments,
        messageId,
        timestamp: new Date().toISOString()
      });
    });
  }

  // Close chat as admin
  closeChat(ticketId: string, resolutionSummary?: string): void {
    if (this.isConnected && this.socket) {

      this.socket.emit('admin_close_chat', {
        ticketId,
        resolutionSummary
      });
    }
  }

  // Admin typing indicator
  sendTypingIndicator(ticketId: string, isTyping: boolean): void {
    if (this.isConnected && this.socket) {
      this.socket.emit('admin_typing', { ticketId, isTyping });
    }
  }

  // Get active tickets for admin
  getActiveTickets(status?: string): void {
    if (this.isConnected && this.socket) {

      this.socket.emit('get_admin_active_tickets', { status });
    }
  }

  // Join chat as admin
  joinChat(ticketId: string): void {
    if (this.isConnected && this.socket) {

      this.socket.emit('join_chat', { ticketId });
    }
  }

  // Event management
  on(event: string, callback: Function): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(callback);

    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[AdminChatSocket] Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Utility methods
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socket: !!this.socket,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Clean disconnect
  disconnect(): void {
    if (this.socket) {

      this.socket.disconnect();
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }
}

export default new AdminChatSocketService();