// Enhanced Chat Types following the documentation
export interface ChatMessage {
  _id?: string;
  ticketId: string;
  message: string;
  isAdminReply: boolean;
  timestamp: Date;
  senderName?: string;
  senderModel?: 'DTUser' | 'Admin';
  attachments?: any[];
  pending?: boolean;
  messageId?: string;
}

export interface ChatTicket {
  _id: string;
  ticketId: string;
  ticketNumber: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
  };
  status: 'open' | 'in_progress' | 'waiting_for_user' | 'closed';
  category: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  assignedAgent?: {
    _id: string;
    fullName: string;
    email: string;
  };
  messages: ChatMessage[];
  lastUpdated: Date;
  createdAt: Date;
  hasNewMessage?: boolean;
  userName?: string;
  userEmail?: string;
}

export interface StartChatResponse {
  success: boolean;
  message: string;
  data: {
    ticketId: string;
    ticketNumber: string;
    status: string;
    messages: ChatMessage[];
  };
}

export interface ChatHistoryResponse {
  success: boolean;
  data: {
    tickets: ChatTicket[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalTickets: number;
      limit: number;
    };
  };
}

export interface ActiveChatsResponse {
  success: boolean;
  data: {
    activeChats: ChatTicket[];
    totalCount: number;
  };
}

export interface AdminActiveChatsResponse {
  success: boolean;
  data: {
    chats: ChatTicket[];
    totalCount: number;
    stats: {
      total: number;
      open: number;
      inProgress: number;
      waitingForUser: number;
      closed: number;
    };
  };
}

export interface JoinChatResponse {
  success: boolean;
  data: {
    ticket: ChatTicket;
    userName: string;
    userEmail: string;
    messages: ChatMessage[];
    status: string;
  };
}

export interface ChatConnectionStatus {
  connected: boolean;
  socket?: boolean;
  reconnectAttempts?: number;
  reason?: string;
}

export interface SocketEventData {
  ticketId: string;
  message?: string;
  isTyping?: boolean;
  status?: string;
  agentName?: string;
  userName?: string;
  userId?: string;
  resolutionSummary?: string;
  category?: string;
  priority?: string;
  attachments?: any[];
  timestamp?: Date;
}

export interface ChatStats {
  total: number;
  open: number;
  inProgress: number;
  waitingForUser: number;
  closed: number;
}

export interface MessageQueueItem {
  ticketId: string;
  message: string;
  attachments?: any[];
  timestamp: Date;
}

export interface EventSubscription {
  event: string;
  callback: Function;
  unsubscribe: () => void;
}

export type ChatUserType = 'user' | 'admin';
export type ChatCategory = 'general_inquiry' | 'technical_support' | 'billing' | 'account_issue' | 'feature_request' | 'bug_report';
export type ChatPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ChatStatus = 'open' | 'in_progress' | 'waiting_for_user' | 'closed';

// Socket.IO Events
export interface SocketEvents {
  // Connection events
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;
  reconnect: (attemptNumber: number) => void;
  reconnect_failed: () => void;
  
  // Chat session events
  active_tickets: (data: { tickets: ChatTicket[] }) => void;
  chat_started: (data: ChatTicket) => void;
  chat_history: (data: { ticket: ChatTicket }) => void;
  ticket_rejoined: (data: { ticket: ChatTicket }) => void;
  
  // Message events
  new_message: (message: ChatMessage) => void;
  message_sent: (data: { messageId: string; success: boolean }) => void;
  
  // Admin events
  agent_joined: (data: SocketEventData) => void;
  agent_typing: (data: SocketEventData) => void;
  user_typing: (data: SocketEventData) => void;
  
  // Status events
  chat_closed: (data: SocketEventData) => void;
  ticket_status_updated: (data: SocketEventData) => void;
  
  // Admin-specific events
  new_chat_ticket: (data: ChatTicket) => void;
  user_message: (data: SocketEventData) => void;
  
  // Error events
  error: (error: Error) => void;
}

// Enhanced Chat Service Interface
export interface IChatSocketService {
  connect(token: string, userType: ChatUserType): Promise<boolean>;
  disconnect(): void;
  sendMessage(ticketId: string, message: string, attachments?: any[]): void;
  startChat(message: string, category?: ChatCategory, priority?: ChatPriority): void;
  rejoinTicket(ticketId: string): void;
  getChatHistory(ticketId: string): void;
  joinTicketAsAdmin(ticketId: string): void;
  closeChatAsAdmin(ticketId: string, resolutionSummary?: string): void;
  sendTypingIndicator(ticketId: string, isTyping: boolean): void;
  on(event: string, callback: Function): () => void;
  getTicket(ticketId: string): ChatTicket | undefined;
  getActiveTickets(): ChatTicket[];
  getConnectionStatus(): ChatConnectionStatus;
}

// Enhanced Chat API Interface
export interface IChatAPI {
  startChat(message: string, category?: string, priority?: string): Promise<StartChatResponse>;
  getActiveChats(): Promise<ActiveChatsResponse>;
  getChatHistory(page?: number, limit?: number): Promise<ChatHistoryResponse>;
  getChatTicket(ticketId: string): Promise<any>;
  sendMessage(ticketId: string, message: string, attachments?: any[]): Promise<any>;
  getAdminActiveChats(status?: string): Promise<AdminActiveChatsResponse>;
  joinChatAsAdmin(ticketId: string): Promise<JoinChatResponse>;
  closeChatAsAdmin(ticketId: string, resolutionSummary?: string): Promise<any>;
}