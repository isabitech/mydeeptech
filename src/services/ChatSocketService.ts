import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  text: string;
  isAdmin: boolean;
  timestamp: string;
  senderName: string;
}

interface SocketResponse {
  success: boolean;
  message?: string;
  data?: any;
}

class ChatSocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Connect to Socket.IO server
   */
  connect(token: string, userType: 'user' | 'admin' = 'user'): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        // Disconnect existing connection
        if (this.socket) {
          this.disconnect();
        }

        const serverUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000';

        this.socket = io(`${serverUrl}`, { // Use correct namespace
          auth: { token },
          query: { userType },
          transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
          timeout: 30000, // 30 second timeout
          reconnectionDelay: 2000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: this.maxReconnectAttempts,
          randomizationFactor: 0.5,
          autoConnect: false // Don't auto-connect, we'll connect manually
        });

        // Connection successful
        this.socket.on('connect', () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connection_status', { connected: true });
          this.addSocketListeners();
          
          // Join appropriate room based on user type
          if (userType === 'admin') {
            this.socket?.emit('join_admin_room');
          } else {
            this.socket?.emit('get_active_tickets');
          }
          
          resolve(true);
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
          this.isConnected = false;
          this.emit('connection_status', { connected: false, error: error.message });
          
          // Auto-reconnect logic
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
              this.socket?.connect();
            }, 2000 * this.reconnectAttempts); // Exponential backoff
          } else {
            reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts: ${error.message}`));
          }
        });

        // Disconnection
        this.socket.on('disconnect', (reason) => {

          this.isConnected = false;
          this.emit('connection_status', { connected: false, reason });
        });

        // Authentication error
        this.socket.on('error', (error) => {

          this.isConnected = false;
          reject(new Error(`Authentication failed: ${error}`));
        });

        // Start connection
        this.socket.connect();

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Setup event listeners for Socket.IO events
   */
  private setupEventListeners() {
    // We'll add listeners when socket is connected
  }

  /**
   * Add event listeners after connection is established
   */
  private addSocketListeners() {
    if (!this.socket) return;

    // Chat events
    this.socket.on('new_message', (data) => {

      this.emit('new_message', data);
    });

    // Auto-rejoin events for session persistence
    this.socket.on('active_tickets', (data) => {

      this.emit('active_tickets', data);
    });

    this.socket.on('chat_history', (data) => {

      this.emit('chat_history', data);
    });

    this.socket.on('ticket_rejoined', (data) => {

      this.emit('ticket_rejoined', data);
    });

    this.socket.on('chat_started', (data) => {

      this.emit('chat_started', data);
    });

    this.socket.on('agent_joined', (data) => {

      this.emit('agent_joined', data);
    });

    this.socket.on('chat_closed', (data) => {

      this.emit('chat_closed', data);
    });

    this.socket.on('agent_typing', (data) => {
      this.emit('agent_typing', data);
    });

    this.socket.on('message_sent', (data) => {

      this.emit('message_sent', data);
    });

    // Listen for message delivery confirmations
    this.socket.on('message_delivered', (data) => {

      this.emit('message_delivered', data);
    });

    // Listen for errors
    this.socket.on('chat_error', (data) => {

      this.emit('chat_error', data);
    });

    // Admin events (if admin)
    this.socket.on('new_chat_ticket', (data) => {

      this.emit('new_chat_ticket', data);
    });

    this.socket.on('user_message', (data) => {

      this.emit('user_message', data);
    });
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Check if socket is connected
   */
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Join chat room
   */
  joinChatRoom(ticketId: string, isAdmin: boolean = false) {
    if (this.isSocketConnected()) {
      if (isAdmin) {
        this.socket?.emit('join_ticket', { ticketId });
      } else {
        this.socket?.emit('join_chat_room', { ticketId });
      }
    } else {
      throw new Error('Cannot join chat room: Socket not connected');
    }
  }

  /**
   * Send chat message
   */
  sendMessage(ticketId: string, message: string, attachments: any[] = [], isAdmin: boolean = false) {
    if (this.isSocketConnected()) {
      if (isAdmin) {
        this.socket?.emit('admin_send_message', {
          ticketId,
          message,
          attachments,
          isAdminReply: true,
          timestamp: new Date().toISOString()
        });
      } else {
        this.socket?.emit('send_message', {
          ticketId,
          message,
          attachments,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      throw new Error('Socket not connected');
    }
  }

  /**
   * Start typing indicator
   */
  startTyping(ticketId: string) {
    if (this.isSocketConnected()) {
      this.socket?.emit('user_typing', { ticketId, isTyping: true });
    }
  }

  /**
   * Stop typing indicator
   */
  stopTyping(ticketId: string) {
    if (this.isSocketConnected()) {
      this.socket?.emit('user_typing', { ticketId, isTyping: false });
    }
  }

  /**
   * Auto-rejoin methods for session persistence
   */
  rejoinTicket(ticketId: string) {
    if (this.isSocketConnected()) {
      this.socket?.emit('rejoin_ticket', { ticketId });
    } else {
      throw new Error('Cannot rejoin ticket: Socket not connected');
    }
  }

  startChat(message: string, category: string = 'general_inquiry', priority: string = 'medium') {
    if (this.isSocketConnected()) {
      this.socket?.emit('start_chat', { message, category, priority });
    } else {
      throw new Error('Cannot start chat: Socket not connected');
    }
  }

  getActiveTickets() {
    if (this.isSocketConnected()) {
      this.socket?.emit('get_active_tickets');
    }
  }

  /**
   * Admin methods
   */
  joinAdminRoom() {
    if (this.isSocketConnected()) {
      this.socket?.emit('join_admin_room');
    }
  }

  joinChat(ticketId: string) {
    if (this.isSocketConnected()) {
      this.socket?.emit('join_chat', { ticketId });
    }
  }

  sendAdminMessage(ticketId: string, message: string, attachments: any[] = []) {
    if (this.isSocketConnected()) {
      this.socket?.emit('admin_send_message', { ticketId, message, attachments });
    }
  }

  closeChat(ticketId: string, resolutionSummary?: string) {
    if (this.isSocketConnected()) {
      this.socket?.emit('admin_close_chat', { ticketId, resolutionSummary });
    }
  }

  /**
   * Get the socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Event management
   */
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }
}

// Export singleton instance
export const chatSocketService = new ChatSocketService();
export default chatSocketService;