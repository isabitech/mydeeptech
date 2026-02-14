// Enhanced Chat Socket Service with complete Socket.IO integration
import { io, Socket } from 'socket.io-client';
import { 
  ChatMessage, 
  ChatTicket, 
  IChatSocketService, 
  ChatUserType, 
  ChatCategory, 
  ChatPriority,
  ChatConnectionStatus,
  MessageQueueItem
} from '../types/enhanced-chat.types';

class EnhancedChatSocketService implements IChatSocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 15;
  private messageQueue: MessageQueueItem[] = [];
  private eventListeners: Map<string, Set<Function>> = new Map();
  private currentTickets: Map<string, ChatTicket> = new Map();
  private userType: ChatUserType = 'user';
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private typingTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.setupHeartbeat();
  }

  // Enhanced connection with production configuration
  async connect(token: string, userType: ChatUserType = 'user'): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const url = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000';
      console.log('🔌 Connecting to Socket.IO server:', url);
      
      this.userType = userType;
      
      this.socket = io(url, { // Use correct namespace
        auth: { token },
        query: { userType },
        transports: ['polling', 'websocket'],
        timeout: 30000,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        randomizationFactor: 0.5,
        autoConnect: false,
      });

      this.setupCompleteEventListeners();
      this.setupReconnectionLogic();

      // Connection success/failure handling
      this.socket.on('connect', () => {
        console.log('✅ Chat service connected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.flushMessageQueue();
        this.emit('connection_status', { connected: true });
        
        // Request active tickets for users
        if (userType === 'user') {
          this.socket?.emit('get_active_tickets');
        }
        
        resolve(true);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection failed:', error);
        this.reconnectAttempts++;
        this.emit('connection_error', { error, attempts: this.reconnectAttempts });
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Maximum connection attempts reached'));
        }
      });

      // Manually connect
      this.socket.connect();
    });
  }

  // Complete Socket.IO event setup following the enhanced guide
  private setupCompleteEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('disconnect', (reason) => {
      console.log('❌ Chat service disconnected:', reason);
      this.isConnected = false;
      this.emit('connection_status', { connected: false, reason });
    });

    // Chat session events
    this.socket.on('active_tickets', (data) => {
      console.log('📋 Active tickets loaded:', data);
      if (data.tickets && Array.isArray(data.tickets)) {
        data.tickets.forEach((ticket: ChatTicket) => {
          this.currentTickets.set(ticket._id, ticket);
        });
        this.emit('active_tickets', data.tickets);
      }
    });

    this.socket.on('chat_started', (data) => {
      console.log('🚀 Chat started:', data);
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

    this.socket.on('chat_history', (data) => {
      console.log('📋 Chat history received:', data);
      if (data.ticket) {
        this.currentTickets.set(data.ticket._id, data.ticket);
        this.emit('chat_history_loaded', data.ticket);
      }
    });

    this.socket.on('ticket_rejoined', (data) => {
      console.log('🔄 Ticket rejoined:', data);
      if (data.ticket) {
        this.currentTickets.set(data.ticket._id, data.ticket);
        this.emit('ticket_rejoined', data.ticket);
      }
    });

    // Message events - CRITICAL FOR SYNCED COMMUNICATION
    this.socket.on('new_message', (message: ChatMessage) => {
      console.log('💬 New message received:', message);
      
      // Update local ticket data
      const ticket = this.currentTickets.get(message.ticketId);
      if (ticket) {
        ticket.messages = ticket.messages || [];
        const existingMessage = ticket.messages.find(m => m._id === message._id);
        if (!existingMessage) {
          ticket.messages.push(message);
          ticket.lastUpdated = new Date();
          this.currentTickets.set(message.ticketId, ticket);
        }
      }
      
      this.emit('new_message', message);
    });

    this.socket.on('message_sent', (data) => {
      console.log('✅ Message sent confirmation:', data);
      this.emit('message_sent', data);
    });

    // Admin events
    this.socket.on('agent_joined', (data) => {
      console.log('👨‍💼 Agent joined chat:', data);
      this.emit('agent_joined', data);
    });

    this.socket.on('agent_typing', (data) => {
      console.log('⌨️ Agent is typing:', data);
      this.emit('agent_typing', data);
    });

    this.socket.on('user_typing', (data) => {
      console.log('⌨️ User is typing:', data);
      this.emit('user_typing', data);
    });

    // Status events
    this.socket.on('chat_closed', (data) => {
      console.log('📪 Chat closed:', data);
      this.currentTickets.delete(data.ticketId);
      this.emit('chat_closed', data);
    });

    this.socket.on('ticket_status_updated', (data) => {
      console.log('📊 Ticket status updated:', data);
      const ticket = this.currentTickets.get(data.ticketId);
      if (ticket) {
        ticket.status = data.status;
        ticket.lastUpdated = new Date();
        this.currentTickets.set(data.ticketId, ticket);
      }
      this.emit('ticket_status_updated', data);
    });

    // Admin-specific events
    this.socket.on('new_chat_ticket', (data) => {
      console.log('🆕 New chat ticket (admin):', data);
      this.emit('new_chat_ticket', data);
    });

    this.socket.on('user_message', (data) => {
      console.log('👤 User message (admin notification):', data);
      this.emit('user_message_notification', data);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('❌ Socket.IO error:', error);
      this.emit('socket_error', error);
    });

    // Heartbeat response
    this.socket.on('heartbeat_response', () => {
      console.log('💓 Heartbeat acknowledged');
    });
  }

  // Enhanced reconnection logic
  private setupReconnectionLogic() {
    if (!this.socket) return;

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.rejoinActiveTickets();
      this.emit('reconnected', { attempts: attemptNumber });
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after maximum attempts');
      this.emit('reconnection_failed', { attempts: this.maxReconnectAttempts });
    });
  }

  // Message queue for offline scenarios
  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const queuedMessage = this.messageQueue.shift();
      if (queuedMessage) {
        this.sendMessage(queuedMessage.ticketId, queuedMessage.message, queuedMessage.attachments);
      }
    }
  }

  // Enhanced message sending with proper routing
  sendMessage(ticketId: string, message: string, attachments: any[] = []): void {
    const messageData: MessageQueueItem = {
      ticketId,
      message,
      attachments,
      timestamp: new Date(),
      isAdminReply: false  // Always false for user messages from this service
    };

    if (this.isConnected && this.socket) {
      console.log('📤 Sending user message via Socket.IO:', messageData);
      this.socket.emit('send_message', messageData);
    } else {
      console.warn('📥 Queueing user message for later delivery:', messageData);
      this.messageQueue.push(messageData);
      this.emit('message_queued', messageData);
    }
  }

  // Start new chat with proper event handling
  startChat(message: string, category: ChatCategory = 'general_inquiry', priority: ChatPriority = 'medium'): void {
    if (this.isConnected && this.socket) {
      console.log('🚀 Starting new chat via Socket.IO');
      this.socket.emit('start_chat', { 
        message, 
        category, 
        priority, 
        isAdminReply: false  // User starting chat, not admin
      });
    } else {
      this.emit('connection_error', { message: 'Not connected to chat server' });
    }
  }

  // Rejoin ticket with room management
  rejoinTicket(ticketId: string): void {
    if (this.isConnected && this.socket) {
      console.log('🔄 Rejoining ticket:', ticketId);
      this.socket.emit('rejoin_ticket', { ticketId });
      
      // Also join the chat room
      this.socket.emit('join_chat_room', { ticketId });
    }
  }

  // Get chat history
  getChatHistory(ticketId: string): void {
    if (this.isConnected && this.socket) {
      this.socket.emit('get_chat_history', { ticketId });
    }
  }

  // Admin functions with proper room management
  joinTicketAsAdmin(ticketId: string): void {
    if (this.isConnected && this.socket && this.userType === 'admin') {
      console.log('👨‍💼 Admin joining ticket:', ticketId);
      this.socket.emit('join_ticket', { ticketId });
      this.socket.emit('join_chat_room', { ticketId });
    }
  }

  closeChatAsAdmin(ticketId: string, resolutionSummary: string = ''): void {
    if (this.isConnected && this.socket && this.userType === 'admin') {
      this.socket.emit('close_chat', { ticketId, resolutionSummary });
    }
  }

  // Typing indicators with proper throttling
  sendTypingIndicator(ticketId: string, isTyping: boolean): void {
    if (this.isConnected && this.socket) {
      this.socket.emit('typing', { ticketId, isTyping });
      
      if (isTyping) {
        // Auto-stop typing after 3 seconds
        if (this.typingTimeout) clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
          this.sendTypingIndicator(ticketId, false);
        }, 3000);
      }
    }
  }

  // Rejoin all active tickets
  private rejoinActiveTickets(): void {
    this.currentTickets.forEach((ticket, ticketId) => {
      this.rejoinTicket(ticketId);
    });
  }

  // Event subscription system
  on(event: string, callback: Function): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  // Emit events to listeners
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
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

  getConnectionStatus(): ChatConnectionStatus {
    return {
      connected: this.isConnected,
      socket: !!this.socket,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Get socket instance (for advanced usage)
  getSocket(): Socket | null {
    return this.socket;
  }

  // Heartbeat mechanism
  private setupHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.socket) {
        this.socket.emit('heartbeat');
      }
    }, 30000); // 30 second heartbeat
  }

  // Clean disconnect
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting chat service...');
      this.socket.disconnect();
      this.isConnected = false;
      this.currentTickets.clear();
      this.messageQueue = [];
      this.eventListeners.clear();
      
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }
    }
  }
}

export default new EnhancedChatSocketService();