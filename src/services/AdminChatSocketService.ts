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
      const url = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('🔌 [AdminChatSocket] Connecting to Socket.IO server:', url);
      
      this.socket = io(url, {
        auth: { token },
        query: { userType: 'admin' },
        transports: ['websocket', 'polling'],
        timeout: 30000,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        randomizationFactor: 0.5,
        autoConnect: false,
      });

      this.setupEventListeners();
      this.setupReconnectionLogic();

      // Connection success
      this.socket.on('connect', () => {
        console.log('✅ [AdminChatSocket] Admin connected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connection_status', { connected: true });
        
        // Join admin room
        this.socket?.emit('join_admin_room');
        resolve(true);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ [AdminChatSocket] Connection failed:', error);
        this.reconnectAttempts++;
        this.emit('connection_error', { error, attempts: this.reconnectAttempts });
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Maximum admin connection attempts reached'));
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
      console.log('❌ [AdminChatSocket] Admin disconnected:', reason);
      this.isConnected = false;
      this.emit('connection_status', { connected: false, reason });
    });

    // Admin-specific events
    this.socket.on('new_chat_ticket', (data) => {
      console.log('🎫 [AdminChatSocket] New chat ticket received:', data);
      this.emit('new_chat_ticket', data);
    });

    this.socket.on('user_message', (data) => {
      console.log('👤 [AdminChatSocket] User message received:', data);
      this.emit('user_message', data);
    });

    // Handle all messages for real-time sync
    this.socket.on('new_message', (data) => {
      console.log('💬 [AdminChatSocket] New message received:', data);
      this.emit('new_message', data);
    });

    this.socket.on('message_sent', (data) => {
      console.log('✅ [AdminChatSocket] Message sent confirmation:', data);
      this.emit('message_sent', data);
    });

    this.socket.on('message_send_success', (data) => {
      console.log('✅ [AdminChatSocket] Message send success:', data);
      this.emit('message_send_success', data);
    });

    this.socket.on('message_send_error', (data) => {
      console.error('❌ [AdminChatSocket] Message send error:', data);
      this.emit('message_send_error', data);
    });

    this.socket.on('chat_closed', (data) => {
      console.log('📪 [AdminChatSocket] Chat closed:', data);
      this.emit('chat_closed', data);
    });

    this.socket.on('ticket_status_updated', (data) => {
      console.log('📊 [AdminChatSocket] Ticket status updated:', data);
      this.emit('ticket_status_updated', data);
    });

    this.socket.on('user_typing', (data) => {
      console.log('⌨️ [AdminChatSocket] User is typing:', data);
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
      console.log(`🔄 [AdminChatSocket] Admin reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      // Rejoin admin room after reconnection
      this.socket?.emit('join_admin_room');
      this.emit('reconnected', { attempts: attemptNumber });
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ [AdminChatSocket] Admin reconnection failed');
      this.emit('reconnection_failed', { attempts: this.maxReconnectAttempts });
    });
  }

  // Admin room management
  joinAdminRoom() {
    if (this.isConnected && this.socket) {
      console.log('🏠 [AdminChatSocket] Joining admin room');
      this.socket.emit('join_admin_room');
    }
  }

  // Join specific chat ticket as admin
  joinChatRoom(ticketId: string) {
    if (this.isConnected && this.socket) {
      console.log('🏠 [AdminChatSocket] Admin joining chat room:', ticketId);
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

      console.log('📤 [AdminChatSocket] Sending admin message:', { ticketId, message });
      
      // Set up one-time listeners for this message
      const messageId = `${ticketId}_${Date.now()}`;
      
      const onSuccess = (data: any) => {
        console.log('✅ [AdminChatSocket] Message sent successfully:', data);
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
      console.log('🔒 [AdminChatSocket] Admin closing chat:', ticketId);
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
      console.log('📋 [AdminChatSocket] Requesting active tickets for admin');
      this.socket.emit('get_admin_active_tickets', { status });
    }
  }

  // Join chat as admin
  joinChat(ticketId: string): void {
    if (this.isConnected && this.socket) {
      console.log('🔗 [AdminChatSocket] Admin joining chat:', ticketId);
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
      console.log('🔌 [AdminChatSocket] Admin disconnecting...');
      this.socket.disconnect();
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }
}

export default new AdminChatSocketService();