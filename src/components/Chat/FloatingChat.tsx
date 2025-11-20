import React, { useState, useEffect, useRef } from 'react';
import { 
  Button, 
  Input, 
  Card, 
  Avatar, 
  Tooltip, 
  Badge,
  Select,
  Spin,
  message,
  Divider 
} from 'antd';
import { 
  MessageOutlined, 
  SendOutlined, 
  CloseOutlined, 
  CustomerServiceOutlined,
  MinusOutlined,
  LoadingOutlined,
  UserOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserChat } from '../../hooks/Chat/useUserChat';
import ChatSocketService from '../../services/ChatSocketService';
import { ChatMessage } from '../../types/chat.types';

const { TextArea } = Input;
const { Option } = Select;

interface FloatingChatProps {
  token: string;
}

const FloatingChat: React.FC<FloatingChatProps> = ({ token }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [activeTickets, setActiveTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [category, setCategory] = useState<string>('general_inquiry');
  const [priority, setPriority] = useState<string>('medium');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    startChat, 
    sendMessage: sendMessageAPI, 
    getActiveChats,
    loading 
  } = useUserChat();

  useEffect(() => {
    if (!isOpen) return;

    // Initialize socket connection
    ChatSocketService.connect(token, 'user').then(() => {
      // Load active tickets when connected
      loadActiveTickets();
    });

    // Socket event listeners
    ChatSocketService.on('connection_status', (data: { connected: boolean }) => {
      setIsConnected(data.connected);
      if (data.connected) {
        // Request active tickets on connection
        ChatSocketService.getActiveTickets();
      }
    });

    // Auto-rejoin functionality - load existing active tickets
    ChatSocketService.on('active_tickets', (data: any) => {
      console.log('📋 Received active tickets:', data);
      if (data.tickets && data.tickets.length > 0) {
        setActiveTickets(data.tickets);
        
        // Auto-select first active ticket if none selected
        if (!selectedTicket && data.tickets.length > 0) {
          const firstTicket = data.tickets[0];
          selectTicket(firstTicket);
        }
      }
      setIsLoadingTickets(false);
    });

    // Handle rejoining existing ticket
    ChatSocketService.on('ticket_rejoined', (data: any) => {
      console.log('🔄 Successfully rejoined ticket:', data);
      const ticket = {
        ...data,
        _id: data._id || data.ticketId,
        ticketId: data.ticketId || data._id
      };
      
      setSelectedTicket(ticket);
      setTicketId(data.ticketId || data._id);
      setMessages(data.messages || []);
      
      // Join the chat room for real-time updates
      if (isConnected) {
        ChatSocketService.joinChatRoom(data.ticketId || data._id);
      }
      
      message.success('Reconnected to your chat session');
    });

    // Handle new chat started
    ChatSocketService.on('chat_started', (data: any) => {
      console.log('🚀 New chat started:', data);
      const newTicket = {
        ...data,
        _id: data._id || data.ticketId,
        ticketId: data.ticketId || data._id
      };
      
      setSelectedTicket(newTicket);
      setTicketId(data.ticketId || data._id);
      setMessages(data.messages || []);
      setNewMessage(''); // Clear the message now that chat started
      setIsInitializing(false); // Clear loading state
      
      // Join the chat room immediately
      if (isConnected) {
        ChatSocketService.joinChatRoom(data.ticketId || data._id);
      }
      
      // Add to active tickets if not already there
      setActiveTickets(prev => {
        const exists = prev.some(ticket => 
          ticket._id === newTicket._id || 
          ticket.ticketId === newTicket.ticketId
        );
        return exists ? prev : [newTicket, ...prev];
      });
      
      message.success('Chat started successfully!');
    });

    // Handle chat history for existing tickets
    ChatSocketService.on('chat_history', (data: any) => {
      console.log('📋 Received chat history:', data);
      setSelectedTicket(data);
      setTicketId(data.ticketId || data._id);
      setMessages(data.messages || []);
    });

    ChatSocketService.on('new_message', (data: any) => {
      console.log('📨 Received new message:', data);
      const newMsg: ChatMessage = {
        _id: data.messageId || `msg-${Date.now()}`,
        sender: data.sender,
        senderModel: data.isAdminReply ? 'Admin' : 'DTUser',
        senderName: data.senderName || (data.isAdminReply ? 'Support Agent' : 'You'),
        message: data.message,
        isAdminReply: data.isAdminReply,
        timestamp: data.timestamp || new Date().toISOString(),
      };
      
      // Add message if it's for the current ticket or if no specific ticket selected yet
      const currentTicketId = selectedTicket?._id || selectedTicket?.ticketId || ticketId;
      const messageTicketId = data.ticketId;
      
      console.log('🎯 Message routing:', {
        currentTicketId,
        messageTicketId,
        isAdminReply: data.isAdminReply,
        willAdd: !currentTicketId || messageTicketId === currentTicketId
      });
      
      // Always add admin replies, and user messages if they're for current ticket
      if (!currentTicketId || messageTicketId === currentTicketId) {
        setMessages(prev => [...prev, newMsg]);
      }
      
      if (data.isAdminReply && isMinimized) {
        setHasUnreadMessages(true);
        message.info(`Support agent: ${data.message}`);
      }
    });

    ChatSocketService.on('agent_joined', (data: any) => {
      const systemMsg: ChatMessage = {
        _id: `system-${Date.now()}`,
        sender: 'system',
        senderModel: 'Admin',
        senderName: 'System',
        message: `${data.agentName} joined the chat`,
        isAdminReply: false,
        timestamp: data.joinedAt,
      };
      setMessages(prev => [...prev, systemMsg]);
      message.success(`${data.agentName} joined the chat`);
    });

    ChatSocketService.on('agent_typing', (data: any) => {
      setAgentTyping(data.isTyping);
      if (data.isTyping) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setAgentTyping(false);
        }, 3000);
      }
    });

    // Handle message confirmations
    ChatSocketService.on('message_sent', (data: any) => {
      console.log('✅ Message sent successfully:', data);
      // Could show a small check mark or confirmation
    });

    ChatSocketService.on('message_delivered', (data: any) => {
      console.log('📬 Message delivered to recipient:', data);
    });

    ChatSocketService.on('chat_error', (data: any) => {
      console.error('❌ Chat error:', data);
      message.error(`Chat error: ${data.message || 'Unknown error'}`);
      setIsInitializing(false);
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      ChatSocketService.disconnect();
    };
  }, [isOpen, token, isMinimized, selectedTicket?.ticketId, selectedTicket?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setHasUnreadMessages(false);
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load active tickets from API
  const loadActiveTickets = async () => {
    setIsLoadingTickets(true);
    try {
      // Use the hook's getActiveChats function
      const result = await getActiveChats();
      if (result.success && result.data) {
        setActiveTickets(result.data.activeChats || []);
        
        // Auto-select first active ticket if none selected
        if (!selectedTicket && result.data.activeChats?.length > 0) {
          const firstTicket = result.data.activeChats[0];
          selectTicket(firstTicket);
        }
      }
    } catch (error) {
      console.error('Error loading active tickets:', error);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  // Select and rejoin a ticket
  const selectTicket = (ticket: any) => {
    console.log('🎯 Selecting ticket:', ticket);
    
    const ticketId = ticket.ticketId || ticket._id;
    setSelectedTicket(ticket);
    setTicketId(ticketId);
    setMessages(ticket.messages || []);
    
    // Join chat room for real-time updates
    if (isConnected && ticketId) {
      console.log('📞 Joining chat room for ticket:', ticketId);
      ChatSocketService.joinChatRoom(ticketId);
      
      // Also try rejoin_ticket event if available
      ChatSocketService.rejoinTicket(ticket._id);
    }
  };

  // Start new chat via Socket.IO
  const startNewChatSocket = () => {
    if (!newMessage.trim()) {
      message.warning('Please enter a message to start the chat');
      return;
    }

    setIsInitializing(true);
    
    // Start chat via Socket.IO for real-time updates
    console.log('🚀 Starting new chat via Socket.IO:', { message: newMessage, category, priority });
    ChatSocketService.startChat(newMessage, category, priority);
    
    // Don't clear message immediately - wait for confirmation
    // setNewMessage('');
  };

  const handleStartChat = async () => {
    if (!newMessage.trim()) {
      message.warning('Please enter a message to start the chat');
      return;
    }

    setIsInitializing(true);
    
    try {
      // Use Socket.IO first if connected for better real-time experience
      if (isConnected) {
        startNewChatSocket();
        return;
      }

      // Fallback to REST API if socket not connected
      const result = await startChat({
        message: newMessage,
        category,
        priority: priority as 'low' | 'medium' | 'high'
      });

      if (result.success && result.data) {
        const newTicket = {
          ...result.data,
          messages: result.data.messages || []
        };
        
        setSelectedTicket(newTicket);
        setTicketId(result.data.ticketId);
        
        // Convert API messages to component format
        const convertedMessages: ChatMessage[] = result.data.messages.map((msg: any) => ({
          _id: msg._id,
          sender: msg.sender,
          senderModel: msg.senderModel,
          senderName: msg.isAdminReply ? 'Support Agent' : 'You',
          message: msg.message,
          isAdminReply: msg.isAdminReply,
          timestamp: msg.timestamp,
        }));
        
        setMessages(convertedMessages);
        setNewMessage('');

        // Add to active tickets
        setActiveTickets(prev => [newTicket, ...prev]);

        // Join chat room for real-time updates
        if (isConnected) {
          ChatSocketService.joinChatRoom(result.data.ticketId);
        }

        message.success(result.data.isExisting ? 'Reconnected to existing chat' : 'Chat started successfully');
      } else {
        message.error(result.error || 'Failed to start chat');
      }
    } catch (error) {
      message.error('Failed to start chat. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || (!ticketId && !selectedTicket)) return;

    const currentTicketId = ticketId || selectedTicket?.ticketId || selectedTicket?._id;
    if (!currentTicketId) return;

    const userMessage: ChatMessage = {
      _id: `temp-${Date.now()}`,
      sender: 'user',
      senderModel: 'DTUser',
      senderName: 'You',
      message: newMessage,
      isAdminReply: false,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Send via socket for real-time
    if (isConnected) {
      ChatSocketService.sendMessage(currentTicketId, newMessage);
    } else {
      // Fallback to API
      sendMessageAPI(currentTicketId, { message: newMessage });
    }

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (ticketId || selectedTicket) {
        handleSendMessage();
      } else {
        handleStartChat();
      }
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const maximizeChat = () => {
    setIsMinimized(false);
    setHasUnreadMessages(false);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-['gilroy-regular'] ">
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Badge dot={hasUnreadMessages} offset={[-8, 8]}>
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<MessageOutlined />}
                onClick={toggleChat}
                className="w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  backgroundColor: '#F6921E',
                  borderColor: '#F6921E',
                  
                }}
              />
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="mb-4"
          >
            <Card
              className="w-96 shadow-2xl border-0 overflow-hidden"
              bodyStyle={{ padding: 0 }}
              style={{
                borderRadius: '16px',
                maxHeight: isMinimized ? '60px' : '500px',
                transition: 'max-height 0.3s ease-in-out'
              }}
            >
              {/* Header */}
              <div 
                className="px-4 py-3 text-white flex items-center justify-between cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #333333 0%, #F6921E 100%)' }}
                onClick={isMinimized ? maximizeChat : undefined}
              >
                <div className="flex items-center space-x-3">
                  <Avatar 
                    icon={<CustomerServiceOutlined />} 
                    style={{ backgroundColor: '#F6921E' }}
                  />
                  <div>
                    <div className="font-['gilroy-semibold'] text-sm">Support Chat</div>
                    <div className="text-xs opacity-90 flex items-center">
                      <div 
                        className={`w-2 h-2 rounded-full mr-2 ${
                          isConnected ? 'bg-green-400' : 'bg-red-400'
                        }`}
                      />
                      {isConnected ? 'Connected' : 'Connecting...'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!isMinimized && (
                    <Tooltip title="Minimize">
                      <Button
                        type="text"
                        size="small"
                        icon={<MinusOutlined />}
                        onClick={minimizeChat}
                        className="text-white hover:bg-white/20"
                      />
                    </Tooltip>
                  )}
                  <Tooltip title="Close">
                    <Button
                      type="text"
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={toggleChat}
                      className="text-white hover:bg-white/20"
                    />
                  </Tooltip>
                </div>
              </div>

              {/* Chat Content */}
              {!isMinimized && (
                <div className="flex flex-col h-96">
                  {/* Active Tickets Selector */}
                  {activeTickets.length > 0 && (
                    <div className="p-3 bg-gray-50 border-b">
                      <div className="text-xs font-['gilroy-medium'] text-gray-600 mb-2">
                        Active Chats ({activeTickets.length})
                      </div>
                      <Select
                        value={selectedTicket?._id || null}
                        onChange={(value) => {
                          const ticket = activeTickets.find(t => t._id === value);
                          if (ticket) selectTicket(ticket);
                        }}
                        placeholder="Select a chat or start new one"
                        size="small"
                        className="w-full"
                        loading={isLoadingTickets}
                      >
                        {activeTickets.map((ticket) => (
                          <Option key={ticket._id} value={ticket._id}>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">
                                {ticket.ticketNumber || `Chat ${ticket._id.slice(-6)}`}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                ticket.status === 'open' ? 'bg-blue-100 text-blue-600' :
                                ticket.status === 'in_progress' ? 'bg-orange-100 text-orange-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {ticket.status?.replace('_', ' ') || 'active'}
                              </span>
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </div>
                  )}

                  {/* Category/Priority Selection (shown when starting new chat) */}
                  {(!ticketId && !selectedTicket) && (
                    <div className="p-4 bg-gray-50 border-b">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="text-xs font-['gilroy-medium'] text-gray-600 mb-1 block">
                            Category
                          </label>
                          <Select
                            value={category}
                            onChange={setCategory}
                            size="small"
                            className="w-full"
                          >
                            <Option value="general_inquiry">General</Option>
                            <Option value="technical_support">Technical</Option>
                            <Option value="account_support">Account</Option>
                            <Option value="billing">Billing</Option>
                            <Option value="bug_report">Bug Report</Option>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs font-['gilroy-medium'] text-gray-600 mb-1 block">
                            Priority
                          </label>
                          <Select
                            value={priority}
                            onChange={setPriority}
                            size="small"
                            className="w-full"
                          >
                            <Option value="low">Low</Option>
                            <Option value="medium">Medium</Option>
                            <Option value="high">High</Option>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {messages.length === 0 && !ticketId && (
                      <div className="text-center text-gray-500 py-8">
                        <CustomerServiceOutlined className="text-4xl mb-3 text-gray-400" />
                        <p className="font-['gilroy-medium']">Start a conversation</p>
                        <p className="text-sm">We're here to help you!</p>
                      </div>
                    )}

                    {messages.map((msg) => (
                      <div key={msg._id} className={`flex ${msg.isAdminReply ? 'justify-start' : 'justify-end'}`}>
                        <div 
                          className={`max-w-xs px-3 py-2 rounded-lg ${
                            msg.isAdminReply 
                              ? 'bg-white text-gray-800 shadow-sm' 
                              : 'text-white shadow-sm'
                          }`}
                          style={{
                            backgroundColor: msg.isAdminReply ? '#ffffff' : '#F6921E'
                          }}
                        >
                          {msg.isAdminReply && (
                            <div className="text-xs text-gray-500 mb-1 font-['gilroy-medium']">
                              {msg.senderName || 'Support Agent'}
                            </div>
                          )}
                          <div className="text-sm font-['gilroy-regular'] leading-relaxed">
                            {msg.message}
                          </div>
                          <div 
                            className={`text-xs mt-1 ${
                              msg.isAdminReply ? 'text-gray-400' : 'text-orange-100'
                            }`}
                          >
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}

                    {agentTyping && (
                      <div className="flex justify-start">
                        <div className="max-w-xs px-3 py-2 bg-white rounded-lg shadow-sm">
                          <div className="text-xs text-gray-500 mb-1 font-['gilroy-medium']">
                            Support Agent
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-600">Typing</span>
                            <LoadingOutlined className="text-gray-400" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  <Divider className="m-0" />

                  {/* Input Area */}
                  <div className="p-4 bg-white">
                    <div className="flex space-x-2">
                      <TextArea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={(ticketId || selectedTicket) ? "Type your message..." : "Describe your issue..."}
                        autoSize={{ minRows: 1, maxRows: 3 }}
                        className="flex-1"
                        disabled={loading || isInitializing}
                      />
                      <Button
                        type="primary"
                        icon={isInitializing || loading ? <LoadingOutlined /> : <SendOutlined />}
                        onClick={(ticketId || selectedTicket) ? handleSendMessage : handleStartChat}
                        disabled={!newMessage.trim() || loading || isInitializing || !isConnected}
                        style={{
                          backgroundColor: '#F6921E',
                          borderColor: '#F6921E'
                        }}
                        className="self-end"
                      >
                        {(ticketId || selectedTicket) ? 'Send' : 'Start'}
                      </Button>
                    </div>
                    
                    {!isConnected && (
                      <div className="text-xs text-red-500 mt-2 flex items-center">
                        <LoadingOutlined className="mr-1" />
                        Connecting to support...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingChat;