// User Chat Socket Service for DTUser real-time communication
import { io, Socket } from 'socket.io-client';
import {
  ChatMessage,
  ChatTicket, 
  ChatCategory, 
  ChatPriority,
  MessageEvent as ChatMessageEvent,
  ChatAttachment,
} from '../types/enhanced-chat.types';

class UserChatSocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 15;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private currentTickets: Map<string, ChatTicket> = new Map();
  
  // Add request deduplication
  private pendingStartChat = false;
  private lastStartChatTime = 0;
  private startChatCooldown = 2000; // 2 second cooldown between start_chat requests

  constructor() {
    // Initialize any required setup
  }

  // User connection with proper configuration
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
      console.log('🔌 [UserChatSocket] Attempting connection to:', url);
      
      // Emit initial connecting status
      this.emit('connection_status', { connected: false, status: 'connecting' });
      
      this.socket = io(url, {
        auth: { token },
        query: { userType: 'dtuser' },
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

      // Connection timeout fallback - increased to 25 seconds
      const connectionTimeout = setTimeout(() => {
        if (!this.isConnected) {
          console.error('❌ [UserChatSocket] Connection timeout after 25 seconds');
          this.emit('connection_status', { 
            connected: false, 
            status: 'timeout',
            error: `Could not connect to ${url}. Please check if the server is running.`
          });
          this.socket?.disconnect();
          reject(new Error(`Connection timeout to ${url}`));
        }
      }, 25000); // Increased from 15 to 25 seconds

      // Connection success
      this.socket.on('connect', () => {
        clearTimeout(connectionTimeout);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connection_status', { connected: true, status: 'connected' });
        
        // Request active tickets for user
        this.socket?.emit('get_active_tickets');
        resolve(true);
      });

      this.socket.on('connect_error', (error: any) => {
        console.error('❌ [UserChatSocket] Connection failed:', error);
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
          reject(new Error(`Maximum connection attempts reached. Last error: ${error.message}`));
        }
      });

      // Start connection
      this.socket.connect();
    });
  }

  // Setup user-specific event listeners
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️ [UserChatSocket] Disconnected:', reason);
      this.isConnected = false;
      this.emit('connection_status', { connected: false, reason, status: 'disconnected' });
    });

    this.socket.on('reconnecting', (attemptNumber) => {
      console.log('🔄 [UserChatSocket] Reconnecting attempt:', attemptNumber);
      this.emit('connection_status', { connected: false, status: 'reconnecting', attempt: attemptNumber });
    });

    // User-specific events
    this.socket.on('active_tickets', (data) => {
      if (data.tickets && Array.isArray(data.tickets)) {
        data.tickets.forEach((ticket: ChatTicket) => {
          this.currentTickets.set(ticket._id, ticket);
        });
        this.emit('active_tickets', data.tickets);
      }
    });

    this.socket.on('chat_started', (data) => {
      const ticket: ChatTicket = {
        _id: data.ticketId,
        ticketId: data.ticketId,
        ticketNumber: data.ticketNumber,
        userId: data.userId || { _id: '', fullName: 'User', email: '' },
        status: data.status || 'open',
        category: data.category || 'general_inquiry',
        priority: data.priority || 'medium',
        messages: data.messages || [],
        lastUpdated: new Date(),
        createdAt: new Date(),
      };
      
      this.currentTickets.set(data.ticketId, ticket);
      this.emit('chat_started', ticket);
    });

    this.socket.on('new_message', (message: ChatMessageEvent) => {
      
      // Update local ticket data only for admin messages to avoid duplicates
      const senderEmail = message.senderEmail || message.userEmail || '';
      const isAdminMessage = message.isAdminReply === true;
      
      const ticket = this.currentTickets.get(message.ticketId);
      if (ticket && isAdminMessage) {
        ticket.messages = ticket.messages || [];
        const existingMessage = ticket.messages.find(m => m._id === message._id);
        if (!existingMessage) {
          // Convert ChatMessageEvent to ChatMessage
          const chatMessage: ChatMessage = {
            _id: message._id,
            ticketId: message.ticketId,
            message: message.message,
            isAdminReply: message.isAdminReply,
            timestamp: new Date(message.timestamp),
            senderName: message.senderName,
            attachments: message.attachments
          };
          ticket.messages.push(chatMessage);
          ticket.lastUpdated = new Date();
          this.currentTickets.set(message.ticketId, ticket);
        }
      }
      
      this.emit('new_message', message);
    });

    // Listen for direct admin messages
    this.socket.on('admin_message', (message: ChatMessageEvent) => {
      this.emit('admin_message', message);
    });

    // Listen for admin replies specifically  
    this.socket.on('admin_reply', (message: ChatMessageEvent) => {
      this.emit('new_message', { ...message, isAdminReply: true });
    });

    this.socket.on('message_sent', (data) => {
      this.emit('message_sent', data);
    });

    this.socket.on('agent_joined', (data) => {
      this.emit('agent_joined', data);
    });

    this.socket.on('agent_typing', (data) => {
      this.emit('agent_typing', data);
    });

    // this.socket.on('chat_closed', (data) => {
    //   console.log('📪 [UserChatSocket] Chat closed:', data);
    //   this.currentTickets.delete(data.ticketId);
    //   this.emit('chat_closed', data);
    // });

    // this.socket.on('ticket_status_updated', (data) => {
    //   console.log('📊 [UserChatSocket] Ticket status updated:', data);
    //   const ticket = this.currentTickets.get(data.ticketId);
    //   if (ticket) {
    //     ticket.status = data.status;
    //     ticket.lastUpdated = new Date();
    //     this.currentTickets.set(data.ticketId, ticket);
    //   }
    //   this.emit('ticket_status_updated', data);
    // });

    this.socket.on('error', (error) => {
      console.error('❌ [UserChatSocket] Socket.IO error:', error);
      this.emit('socket_error', error);
    });
  }

  // Reconnection logic
  private setupReconnectionLogic() {
    if (!this.socket) return;

    this.socket.on('reconnect', (attemptNumber) => {
      this.isConnected = true;
      this.rejoinActiveTickets();
      this.emit('reconnected', { attempts: attemptNumber });
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ [UserChatSocket] Reconnection failed');
      this.emit('reconnection_failed', { attempts: this.maxReconnectAttempts });
    });
  }

  // User message sending
  sendMessage(ticketId: string, message: string, attachments: ChatAttachment[] = []): void {
    if (this.isConnected && this.socket) {
      this.socket.emit('send_message', {
        ticketId,
        message,
        attachments,
        senderModel: 'DTUser',
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('❌ [UserChatSocket] Cannot send message: Not connected');
      throw new Error('Socket not connected');
    }
  }

  // Start new chat
  startChat(message: string, category: ChatCategory = 'general_inquiry', priority: ChatPriority = 'medium'): void {
    if (!this.isConnected || !this.socket) {
      this.emit('connection_error', { message: 'Not connected to chat server' });
      return;
    }

    // Prevent duplicate requests within cooldown period
    const now = Date.now();
    if (this.pendingStartChat || (now - this.lastStartChatTime) < this.startChatCooldown) {
      console.log('🛑 [UserChatSocket] Preventing duplicate start_chat request');
      return;
    }

    // Mark as pending and record timestamp
    this.pendingStartChat = true;
    this.lastStartChatTime = now;

    console.log('🚀 [UserChatSocket] Starting chat:', { message, category, priority });
    
    this.socket.emit('start_chat', { 
      message, 
      category, 
      priority
    });

    // Reset pending flag after a short delay
    setTimeout(() => {
      this.pendingStartChat = false;
    }, 1000);
  }

  // Rejoin ticket
  rejoinTicket(ticketId: string): void {
    if (this.isConnected && this.socket) {
      
      // Try multiple methods to ensure room joining works
      this.socket.emit('get_chat_history', { ticketId });
      this.socket.emit('join_chat_room', { ticketId });
      this.socket.emit('join_room', { ticketId });
      this.socket.emit('rejoin_ticket', { ticketId });
      
    } else {
      console.warn('⚠️ [UserChatSocket] Cannot rejoin ticket: Not connected');
    }
  }

  // Join specific chat room
  joinChatRoom(ticketId: string): void {
    if (this.isConnected && this.socket) {
      this.socket.emit('join_chat_room', { ticketId });
      this.socket.emit('join_room', { ticketId });
    } else {
      console.warn('⚠️ [UserChatSocket] Cannot join room: Not connected');
    }
  }

  // Get chat history
  getChatHistory(ticketId: string): void {
    if (this.isConnected && this.socket) {
      this.socket.emit('get_chat_history', { ticketId });
    }
  }

  // Typing indicators
  sendTypingIndicator(ticketId: string, isTyping: boolean): void {
    if (this.isConnected && this.socket) {
      this.socket.emit('user_typing', { ticketId, isTyping });
    }
  }

  // Rejoin all active tickets
  private rejoinActiveTickets(): void {
    this.currentTickets.forEach((ticket, ticketId) => {
      this.rejoinTicket(ticketId);
    });
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

  private emit(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[UserChatSocket] Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Utility methods
  getTicket(ticketId: string): ChatTicket | undefined {
    return this.currentTickets.get(ticketId);
  }

  getActiveTickets(): ChatTicket[] {
    return Array.from(this.currentTickets.values());
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Clean disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      this.currentTickets.clear();
      this.eventListeners.clear();
    }
  }
}

export default new UserChatSocketService();