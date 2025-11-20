export interface ChatMessage {
  _id: string;
  sender: string;
  senderModel: 'DTUser' | 'Admin';
  senderName?: string;
  message: string;
  isAdminReply: boolean;
  timestamp: string;
  attachments?: string[];
}

export interface ChatTicket {
  _id: string;
  ticketId?: string; // Sometimes the API returns this field
  ticketNumber: string;
  subject?: string;
  status: 'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high';
  category?: 'account_support' | 'technical_support' | 'billing' | 'general_inquiry' | 'bug_report';
  isChat: boolean;
  messages: ChatMessage[];
  userName?: string; // User name from API response
  userEmail?: string; // User email from API response
  userId?: {
    _id: string;
    fullName: string;
    email: string;
  };
  assignedTo?: {
    _id: string;
    fullName: string;
    email: string;
  } | null;
  createdAt: string;
  lastUpdated: string;
  resolvedAt?: string;
  resolutionSummary?: string;
}

export interface ChatPagination {
  currentPage: number;
  totalPages: number;
  totalChats: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export interface StartChatRequest {
  message: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface StartChatResponse {
  success: boolean;
  message: string;
  data: {
    ticketId: string;
    ticketNumber: string;
    status: string;
    messages: ChatMessage[];
    isExisting: boolean;
  };
}

export interface ChatHistoryResponse {
  success: boolean;
  message: string;
  data: {
    chats: ChatTicket[];
    pagination: ChatPagination;
  };
}

export interface SendMessageRequest {
  message: string;
  attachments?: string[];
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: {
    messageId: string;
    timestamp: string;
    ticketStatus: string;
  };
}

export interface ActiveChatsResponse {
  success: boolean;
  message: string;
  data: {
    chats: ChatTicket[];
    count: number;
  };
}

export interface JoinChatResponse {
  success: boolean;
  message: string;
  data: {
    ticketId: string;
    ticketNumber: string;
    assignedTo: string;
    status: string;
    userName: string;
    userEmail: string;
    messages: ChatMessage[];
    priority?: string;
    category?: string;
  };
}

export interface CloseChatRequest {
  resolutionSummary?: string;
}

export interface CloseChatResponse {
  success: boolean;
  message: string;
  data: {
    ticketId: string;
    ticketNumber: string;
    resolvedAt: string;
    resolutionSummary?: string;
  };
}

// Socket.IO event types
export interface SocketEvents {
  // User events
  join_chat_room: { ticketId: string };
  send_message: { ticketId: string; message: string; attachments?: string[] };
  user_typing: { ticketId: string; isTyping: boolean };
  
  // Admin events
  join_admin_room: {};
  join_chat: { ticketId: string };
  admin_send_message: { ticketId: string; message: string; attachments?: string[] };
  admin_close_chat: { ticketId: string; resolutionSummary?: string };
  
  // Server to client events
  new_message: {
    messageId: string;
    ticketId: string;
    sender: string;
    senderName: string;
    message: string;
    isAdminReply: boolean;
    timestamp: string;
  };
  
  message_sent: {
    messageId: string;
    timestamp: string;
    status: string;
  };
  
  agent_joined: {
    ticketId: string;
    agentName: string;
    agentId: string;
    joinedAt: string;
  };
  
  chat_closed: {
    ticketId: string;
    closedBy: string;
    closedAt: string;
    resolutionSummary?: string;
  };
  
  agent_typing: {
    ticketId: string;
    agentName: string;
    isTyping: boolean;
  };
  
  new_chat_ticket: {
    ticketId: string;
    ticketNumber: string;
    userName: string;
    userEmail: string;
    message: string;
    priority: string;
    category: string;
    createdAt: string;
  };
  
  user_message: {
    ticketId: string;
    ticketNumber: string;
    userName: string;
    userEmail: string;
    message: string;
    timestamp: string;
  };
}

export interface HookOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}