// User Chat Socket Service for DTUser real-time communication
import { io, Socket } from 'socket.io-client';
import { 
  ChatMessage, 
  ChatTicket, 
  ChatCategory, 
  ChatPriority
} from '../types/enhanced-chat.types';

class UserChatSocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 15;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private currentTickets: Map<string, ChatTicket> = new Map();

  constructor() {
    // Initialize any required setup
  }

  // User connection with proper configuration
  async connect(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const url = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('🔌 [UserChatSocket] Connecting to Socket.IO server:', url);
      
      this.socket = io(url, {
        auth: { token },
        query: { userType: 'user' },
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
        console.log('✅ [UserChatSocket] Connected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connection_status', { connected: true });
        
        // Request active tickets for user
        this.socket?.emit('get_active_tickets');
        resolve(true);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ [UserChatSocket] Connection failed:', error);
        this.reconnectAttempts++;
        this.emit('connection_error', { error, attempts: this.reconnectAttempts });
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Maximum connection attempts reached'));
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
      console.log('❌ [UserChatSocket] Disconnected:', reason);
      this.isConnected = false;
      this.emit('connection_status', { connected: false, reason });
    });

    // User-specific events
    this.socket.on('active_tickets', (data) => {
      console.log('📋 [UserChatSocket] Active tickets received:', data);
      if (data.tickets && Array.isArray(data.tickets)) {
        data.tickets.forEach((ticket: ChatTicket) => {
          this.currentTickets.set(ticket._id, ticket);
        });
        this.emit('active_tickets', data.tickets);
      }
    });

    this.socket.on('chat_started', (data) => {
      console.log('🚀 [UserChatSocket] Chat started:', data);
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

    this.socket.on('new_message', (message: any) => {
      console.log('💬 [UserChatSocket] New message received:', message);
      
      // Update local ticket data only for admin messages to avoid duplicates
      const senderEmail = message.senderEmail || message.userEmail || '';
      const isAdminMessage = message.isAdminReply === true;
      
      console.log('📋 [UserChatSocket] Message analysis:', {
        isAdminReply: message.isAdminReply,
        isAdminMessage,
        senderEmail,
        ticketId: message.ticketId,
        messageId: message._id
      });
      
      const ticket = this.currentTickets.get(message.ticketId);
      if (ticket && isAdminMessage) {
        ticket.messages = ticket.messages || [];
        const existingMessage = ticket.messages.find(m => m._id === message._id);
        if (!existingMessage) {
          ticket.messages.push(message);
          ticket.lastUpdated = new Date();
          this.currentTickets.set(message.ticketId, ticket);
          console.log('✅ [UserChatSocket] Added admin message to local ticket data');
        }
      }
      
      this.emit('new_message', message);
    });

    // Listen for direct admin messages
    this.socket.on('admin_message', (message: any) => {
      console.log('👨‍💼 [UserChatSocket] Direct admin message received:', message);
      this.emit('admin_message', message);
    });

    // Listen for admin replies specifically  
    this.socket.on('admin_reply', (message: any) => {
      console.log('💬 [UserChatSocket] Admin reply received:', message);
      this.emit('new_message', { ...message, isAdminReply: true });
    });

    this.socket.on('message_sent', (data) => {
      console.log('✅ [UserChatSocket] Message sent confirmation:', data);
      this.emit('message_sent', data);
    });

    this.socket.on('agent_joined', (data) => {
      console.log('👨‍💼 [UserChatSocket] Agent joined chat:', data);
      this.emit('agent_joined', data);
    });

    this.socket.on('agent_typing', (data) => {
      console.log('⌨️ [UserChatSocket] Agent is typing:', data);
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
      console.log(`🔄 [UserChatSocket] Reconnected after ${attemptNumber} attempts`);
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
  sendMessage(ticketId: string, message: string, attachments: any[] = []): void {
    if (this.isConnected && this.socket) {
      console.log('📤 [UserChatSocket] Sending user message:', { ticketId, message, senderModel: 'DTUser' });
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
    if (this.isConnected && this.socket) {
      console.log('🚀 [UserChatSocket] Starting new chat');
      this.socket.emit('start_chat', { 
        message, 
        category, 
        priority
      });
    } else {
      this.emit('connection_error', { message: 'Not connected to chat server' });
    }
  }

  // Rejoin ticket
  rejoinTicket(ticketId: string): void {
    if (this.isConnected && this.socket) {
      console.log('🔄 [UserChatSocket] Rejoining ticket:', ticketId);
      
      // Try multiple methods to ensure room joining works
      this.socket.emit('get_chat_history', { ticketId });
      this.socket.emit('join_chat_room', { ticketId });
      this.socket.emit('join_room', { ticketId });
      this.socket.emit('rejoin_ticket', { ticketId });
      
      console.log('✅ [UserChatSocket] Attempted multiple join methods for ticket:', ticketId);
    } else {
      console.warn('⚠️ [UserChatSocket] Cannot rejoin ticket: Not connected');
    }
  }

  // Join specific chat room
  joinChatRoom(ticketId: string): void {
    if (this.isConnected && this.socket) {
      console.log('🏠 [UserChatSocket] Joining chat room:', ticketId);
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

  private emit(event: string, data: any): void {
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
      console.log('🔌 [UserChatSocket] Disconnecting...');
      this.socket.disconnect();
      this.isConnected = false;
      this.currentTickets.clear();
      this.eventListeners.clear();
    }
  }
}

export default new UserChatSocketService();