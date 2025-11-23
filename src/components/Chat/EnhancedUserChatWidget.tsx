// Enhanced User Chat Widget with proper syncing
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Input, Card, Badge, Typography, Spin, Tag, Avatar, message, Tooltip, Drawer, List, Collapse, Empty, Divider } from 'antd';
import { 
  MessageOutlined, 
  CloseOutlined, 
  MinusOutlined,
  SendOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  UserOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';
import EnhancedChatSocketService from '../../services/EnhancedChatSocketService';
import EnhancedChatAPI from '../../services/EnhancedChatAPI';
import { ChatMessage, ChatTicket } from '../../types/enhanced-chat.types';
import { 
  UserChatHistoryResponse, 
  UserChatHistoryResponseDataChat, 
  Message as HistoryMessage 
} from '../../services/chat-history-type';
import { retrieveTokenFromStorage } from '../../helpers';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Title, Text } = Typography;

const EnhancedUserChatWidget: React.FC = () => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTickets, setActiveTickets] = useState<ChatTicket[]>([]);
  const [currentTicket, setCurrentTicket] = useState<ChatTicket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [chatHistory, setChatHistory] = useState<UserChatHistoryResponseDataChat[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryChat, setSelectedHistoryChat] = useState<UserChatHistoryResponseDataChat | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<any>(null);
  const notificationAudioRef = useRef<HTMLAudioElement>(null);



  // Initialize chat service
  useEffect(() => {
    initializeChat();

    return () => {
      EnhancedChatSocketService.disconnect();
    };
  }, []);

  // Setup event listeners for real-time communication
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Connection events
    unsubscribers.push(
      EnhancedChatSocketService.on('connection_status', ({ connected, reason }: any) => {
        setIsConnected(connected);
        if (!connected) {
          setConnectionError(`Disconnected: ${reason || 'Unknown reason'}`);
        } else {
          setConnectionError(null);
        }
      })
    );

    // Chat session events
    unsubscribers.push(
      EnhancedChatSocketService.on('active_tickets_loaded', (tickets: ChatTicket[]) => {
        console.log('📋 Loading active tickets:', tickets);
        setActiveTickets(tickets);
        if (tickets.length > 0 && !currentTicket) {
          selectTicket(tickets[0]);
        }
      })
    );

    unsubscribers.push(
      EnhancedChatSocketService.on('chat_started', (ticket: ChatTicket) => {
        console.log('🚀 Chat started:', ticket);
        setActiveTickets(prev => {
          const existing = prev.find(t => t._id === ticket._id);
          if (!existing) {
            return [ticket, ...prev];
          }
          return prev;
        });
        setCurrentTicket(ticket);
        setMessages(ticket.messages || []);
        setIsLoading(false);
        scrollToBottom();
      })
    );

    // CRITICAL: Real-time message handling
    unsubscribers.push(
      EnhancedChatSocketService.on('new_message', (message: ChatMessage) => {
        console.log('💬 Received new message:', message);
        
        // Update messages if it's for current ticket
        if (currentTicket && message.ticketId === currentTicket._id) {
          setMessages(prev => {
            const exists = prev.find(m => m._id === message._id);
            if (!exists) {
              // Remove pending message with same content and replace with confirmed message
              const filteredPrev = prev.filter(m => 
                !(m.pending && m.message === message.message && !m.isAdminReply)
              );
              return [...filteredPrev, message];
            }
            return prev;
          });
          scrollToBottom();
        }
        
        // Update ticket in active tickets list
        setActiveTickets(prev => prev.map(ticket => {
          if (ticket._id === message.ticketId) {
            const updatedTicket = { 
              ...ticket, 
              messages: [...(ticket.messages || []), message],
              lastUpdated: new Date()
            };
            return updatedTicket;
          }
          return ticket;
        }));
        
        // Show notification if chat is not open or minimized
        if (!isOpen || isMinimized) {
          setHasUnreadMessages(true);
          showMessageNotification(message);
        }
      })
    );

    unsubscribers.push(
      EnhancedChatSocketService.on('agent_joined', (data: any) => {
        console.log('👨‍💼 Agent joined:', data);
        showNotification(`Agent ${data.agentName || 'Support'} joined the conversation`, 'info');
      })
    );

    unsubscribers.push(
      EnhancedChatSocketService.on('agent_typing', (data: any) => {
        if (currentTicket && data.ticketId === currentTicket._id) {
          setAgentTyping(data.isTyping);
        }
      })
    );

    unsubscribers.push(
      EnhancedChatSocketService.on('chat_closed', (data: any) => {
        console.log('📪 Chat closed:', data);
        if (currentTicket && data.ticketId === currentTicket._id) {
          showNotification('Chat session has been closed by support', 'success');
          // Update ticket status instead of removing
          setActiveTickets(prev => prev.map(ticket => 
            ticket._id === data.ticketId 
              ? { ...ticket, status: 'closed' }
              : ticket
          ));
          if (currentTicket._id === data.ticketId) {
            setCurrentTicket(prev => prev ? { ...prev, status: 'closed' } : null);
          }
        }
      })
    );

    unsubscribers.push(
      EnhancedChatSocketService.on('ticket_status_updated', (data: any) => {
        console.log('📊 Ticket status updated:', data);
        setActiveTickets(prev => prev.map(ticket => 
          ticket._id === data.ticketId 
            ? { ...ticket, status: data.status, lastUpdated: new Date() }
            : ticket
        ));
        if (currentTicket && currentTicket._id === data.ticketId) {
          setCurrentTicket(prev => prev ? { ...prev, status: data.status } : null);
        }
      })
    );

    unsubscribers.push(
      EnhancedChatSocketService.on('message_sent', (data: any) => {
        console.log('✅ Message delivery confirmed:', data);
        // Update pending message to confirmed
        setMessages(prev => prev.map(msg => 
          msg.pending && msg.message === data.message 
            ? { ...msg, pending: false, _id: data.messageId }
            : msg
        ));
      })
    );

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [currentTicket, isOpen, isMinimized]);

  // Initialize chat with token
  const initializeChat = async () => {
    try {
      const token = await retrieveTokenFromStorage();
      if (!token) {
        console.warn('No token found, chat disabled');
        return;
      }

      console.log('🔌 Initializing chat service...');
      await EnhancedChatSocketService.connect(token, 'user');
      
      // Load existing active chats
      const result = await EnhancedChatAPI.getActiveChats();
      if (result.success && result.data.activeChats) {
        setActiveTickets(result.data.activeChats);
        if (result.data.activeChats.length > 0) {
          selectTicket(result.data.activeChats[0]);
        }
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setConnectionError('Failed to connect to chat service');
    }
  };

  // Select ticket and rejoin
  const selectTicket = useCallback((ticket: ChatTicket) => {
    console.log('🎯 Selecting ticket:', ticket.ticketNumber);
    setCurrentTicket(ticket);
    setMessages(ticket.messages || []);
    
    // Rejoin ticket room for real-time updates
    EnhancedChatSocketService.rejoinTicket(ticket._id);
    scrollToBottom();
    setHasUnreadMessages(false);
  }, []);

  // Start new chat
  const startNewChat = async () => {
    if (!newMessage.trim()) return;
    
    setIsLoading(true);
    const messageText = newMessage.trim();
    
    try {
      // Start via Socket.IO for real-time experience
      EnhancedChatSocketService.startChat(messageText, 'general_inquiry', 'medium');
      setNewMessage('');
      
      // Also start via API for consistency
      await EnhancedChatAPI.startChat(messageText);
    } catch (error) {
      console.error('Failed to start chat:', error);
      showNotification('Failed to start chat session', 'error');
      setIsLoading(false);
    }
  };

  // Send message with real-time sync
  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !currentTicket || isLoading) return;
    
    const messageText = newMessage.trim();
    setNewMessage('');
    
    // Add message to local state immediately for instant UI feedback
    const tempMessage: ChatMessage = {
      ticketId: currentTicket._id,
      message: messageText,
      isAdminReply: false,
      timestamp: new Date(),
      senderName: 'You',
      pending: true
    };
    
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();
    
    // Send via Socket.IO for real-time delivery
    EnhancedChatSocketService.sendMessage(currentTicket._id, messageText);
    
    // Focus input
    chatInputRef.current?.focus();
  }, [newMessage, currentTicket, isLoading]);

  // Typing indicator
  const handleTyping = useCallback(() => {
    if (!currentTicket) return;
    EnhancedChatSocketService.sendTypingIndicator(currentTicket._id, true);
  }, [currentTicket]);

  // Load chat history with proper type handling
  const loadChatHistory = async () => {
    try {
      setHistoryLoading(true);
      const result = await EnhancedChatAPI.getChatHistory(1, 50);
      console.log('📚 Chat history response:', result);
      
      if (result.success && result.data) {
        // Handle the UserChatHistoryResponse type
        if ('chats' in result.data && Array.isArray(result.data.chats)) {
          setChatHistory(result.data.chats as UserChatHistoryResponseDataChat[]);
          setShowHistoryDrawer(true);
        } else {
          showNotification('No chat history found', 'info');
        }
      } else {
        showNotification('No chat history found', 'info');
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      message.error('Failed to load chat history');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Utility functions
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const playNotificationSound = () => {
    if (notificationAudioRef.current) {
      notificationAudioRef.current.currentTime = 0; // Reset to start
      notificationAudioRef.current.play().catch(error => {
        console.log('Could not play notification sound:', error);
      });
    }
  };

  const showNotification = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    message[type](text);
    playNotificationSound();
  };

  const showMessageNotification = (chatMessage: ChatMessage) => {
    if (Notification.permission === 'granted') {
      new Notification('New message from support', {
        body: chatMessage.message.substring(0, 100) + '...',
        icon: '/favicon.ico'
      });
    }
    playNotificationSound();
  };

  const formatTime = (timestamp: Date | string) => {
    return dayjs(timestamp).format('HH:mm');
  };

  const formatDate = (timestamp: Date | string) => {
    return dayjs(timestamp).format('MMM DD, YYYY');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'open': '#1890ff',
      'in_progress': '#fa8c16',
      'waiting_for_user': '#faad14',
      'closed': '#52c41a'
    };
    return colors[status as keyof typeof colors] || '#1890ff';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'open': <ClockCircleOutlined />,
      'in_progress': <ExclamationCircleOutlined />,
      'waiting_for_user': <ClockCircleOutlined />,
      'closed': <CheckCircleOutlined />
    };
    return icons[status as keyof typeof icons] || <ClockCircleOutlined />;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (currentTicket) {
        sendMessage();
      } else {
        startNewChat();
      }
    }
    handleTyping();
  };

  // Helper functions for history rendering
  const renderHistoryMessage = (historyMessage: HistoryMessage, index: number) => (
    <div 
      key={index} 
      className={`flex ${historyMessage.isAdminReply ? 'justify-start' : 'justify-end'} mb-3`}
    >
      <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
        historyMessage.isAdminReply 
          ? 'bg-gray-100 text-gray-800' 
          : 'bg-[#F6921E] text-white'
      }`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-medium ${
            historyMessage.isAdminReply ? 'text-gray-600' : 'text-orange-100'
          }`} style={{ fontFamily: 'Gilroy-Medium' }}>
            {historyMessage.isAdminReply ? 'Support Agent' : 'You'}
          </span>
          <span className={`text-xs ${
            historyMessage.isAdminReply ? 'text-gray-500' : 'text-orange-100'
          }`}>
            {formatTime(historyMessage.timestamp)}
          </span>
        </div>
        <div className="whitespace-pre-wrap" style={{ fontFamily: 'Gilroy-Regular' }}>
          {historyMessage.message}
        </div>
      </div>
    </div>
  );

  const reopenChatFromHistory = async (historicalChat: UserChatHistoryResponseDataChat) => {
    try {
      if (historicalChat.status !== 'closed') {
        // If the chat is still open, rejoin it
        const chatTicket: ChatTicket = {
          _id: historicalChat._id,
          ticketId: historicalChat._id,
          ticketNumber: historicalChat.ticketNumber,
          userId: typeof historicalChat.userId === 'string' ? { _id: historicalChat.userId, fullName: 'User', email: '' } : historicalChat.userId,
          status: historicalChat.status as 'open' | 'in_progress' | 'waiting_for_user' | 'closed',
          category: historicalChat.category as any,
          priority: historicalChat.priority as any,
          messages: historicalChat.messages.map(msg => ({
            _id: msg._id,
            ticketId: historicalChat._id,
            message: msg.message,
            isAdminReply: msg.isAdminReply,
            timestamp: new Date(msg.timestamp),
            senderName: msg.isAdminReply ? 'Support Agent' : 'You'
          })),
          lastUpdated: new Date(historicalChat.lastUpdated),
          createdAt: new Date(historicalChat.createdAt)
        };
        
        setActiveTickets(prev => {
          const existing = prev.find(t => t._id === chatTicket._id);
          if (!existing) {
            return [chatTicket, ...prev];
          }
          return prev;
        });
        
        selectTicket(chatTicket);
        setShowHistoryDrawer(false);
        showNotification('Rejoined chat conversation', 'success');
      } else {
        showNotification('This conversation is closed. Please start a new chat.', 'info');
      }
    } catch (error) {
      console.error('Failed to reopen chat:', error);
      showNotification('Failed to reopen chat', 'error');
    }
  };

  // Render message component
  const renderMessage = (chatMessage: ChatMessage, index: number) => (
    <div 
      key={index} 
      className={`flex ${chatMessage.isAdminReply ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        chatMessage.isAdminReply 
          ? 'bg-gray-100 text-gray-800' 
          : 'bg-[#F6921E] text-white'
      } ${chatMessage.pending ? 'opacity-60' : ''}`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-medium ${
            chatMessage.isAdminReply ? 'text-gray-600' : 'text-orange-100'
          }`} style={{ fontFamily: 'Gilroy-Medium' }}>
            {chatMessage.senderName || (chatMessage.isAdminReply ? 'Support Agent' : 'You')}
          </span>
          <span className={`text-xs ${
            chatMessage.isAdminReply ? 'text-gray-500' : 'text-orange-100'
          }`}>
            {formatTime(chatMessage.timestamp)}
          </span>
        </div>
        <div className="whitespace-pre-wrap" style={{ fontFamily: 'Gilroy-Regular' }}>
          {chatMessage.message}
        </div>
        {chatMessage.pending && (
          <div className={`text-xs mt-1 ${
            chatMessage.isAdminReply ? 'text-gray-400' : 'text-orange-200'
          }`} style={{ fontFamily: 'Gilroy-Regular' }}>
            Sending...
          </div>
        )}
      </div>
    </div>
  );

  // Render typing indicator
  const renderTypingIndicator = () => (
    <div className="flex justify-start mb-4">
      <div className="max-w-xs px-4 py-2 bg-gray-100 rounded-lg">
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2" style={{ fontFamily: 'Gilroy-Medium' }}>
            Support is typing
          </span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Chat toggle button
  if (!isOpen) {
    return (
      <div className="fixed bottom-0 right-6 z-50">
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageOutlined />}
          onClick={() => setIsOpen(true)}
          className=" flex items-center justify-center shadow-lg bg-red-500"
        //   style={{ 
        //     backgroundColor: '#F6921E', 
        //     borderColor: '#F6921E',
        //     fontFamily: 'Gilroy-Bold'
        //   }}
        >
          {hasUnreadMessages && (
            <Badge 
              count="!" 
              className="absolute -top-1 -right-1"
              style={{ backgroundColor: '#ff4d4f' }}
            />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div 
        className="text-white p-4 rounded-t-lg flex items-center justify-between"
        style={{ backgroundColor: '#F6921E' }}
      >
        <div className="flex items-center">
          <Avatar size={32} icon={<MessageOutlined />} className="mr-3" style={{ backgroundColor: '#e6820a' }} />
          <div>
            <Title level={5} className="text-white mb-0" style={{ fontFamily: 'Gilroy-Bold' }}>
              Support Chat
            </Title>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-green-300' : 'bg-red-300'
              }`} />
              <Text className="text-orange-100 text-xs" style={{ fontFamily: 'Gilroy-Regular' }}>
                {isConnected ? 'Connected' : 'Reconnecting...'}
              </Text>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Tooltip title="Chat History">
            <Button
              type="text"
              size="small"
              icon={<HistoryOutlined />}
              onClick={loadChatHistory}
              loading={historyLoading}
              className="text-white hover:bg-orange-600"
            />
          </Tooltip>
          <Button
            type="text"
            size="small"
            icon={<MinusOutlined />}
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:bg-orange-600"
          />
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-orange-600"
          />
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Connection Error */}
          {connectionError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3">
              <div className="text-sm text-red-700" style={{ fontFamily: 'Gilroy-Medium' }}>
                {connectionError}
              </div>
              <Button 
                size="small" 
                type="link" 
                onClick={initializeChat}
                className="text-red-600 p-0 h-auto"
                icon={<ReloadOutlined />}
                style={{ fontFamily: 'Gilroy-Medium' }}
              >
                Retry Connection
              </Button>
            </div>
          )}

          {/* Active Tickets Selector */}
          {activeTickets.length > 1 && (
            <div className="p-3 bg-gray-50 border-b">
              <Text className="text-xs text-gray-600 mb-2 block" style={{ fontFamily: 'Gilroy-Medium' }}>
                Active Conversations ({activeTickets.length})
              </Text>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {activeTickets.map(ticket => (
                  <div 
                    key={ticket._id}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      currentTicket?._id === ticket._id 
                        ? 'bg-orange-100 border border-orange-300' 
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => selectTicket(ticket)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getStatusIcon(ticket.status)}
                        <Text className="text-xs font-medium text-gray-800 ml-2" style={{ fontFamily: 'Gilroy-Medium' }}>
                          {ticket.ticketNumber}
                        </Text>
                      </div>
                      <Tag 
                        color={getStatusColor(ticket.status)} 
                        style={{ fontFamily: 'Gilroy-Regular' }}
                      >
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </Tag>
                    </div>
                    <Text className="text-xs text-gray-500" style={{ fontFamily: 'Gilroy-Regular' }}>
                      {formatDate(ticket.lastUpdated)}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {currentTicket ? (
              <>
                {/* Current Ticket Info */}
                <div className="p-3 bg-gray-50 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(currentTicket.status)}
                      <div className="ml-2">
                        <Text className="text-sm font-medium" style={{ fontFamily: 'Gilroy-Bold' }}>
                          {currentTicket.ticketNumber}
                        </Text>
                        <Tag 
                          color={getStatusColor(currentTicket.status)} 
                          className="ml-2"
                          style={{ fontFamily: 'Gilroy-Regular' }}
                        >
                          {currentTicket.status.replace('_', ' ').toUpperCase()}
                        </Tag>
                      </div>
                    </div>
                    <Text className="text-xs text-gray-500" style={{ fontFamily: 'Gilroy-Regular' }}>
                      Created {formatDate(currentTicket.createdAt)}
                    </Text>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <MessageOutlined className="text-4xl mb-2" />
                      <div style={{ fontFamily: 'Gilroy-Medium' }}>No messages yet</div>
                      <div className="text-xs" style={{ fontFamily: 'Gilroy-Regular' }}>
                        Start the conversation!
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((chatMessage, index) => renderMessage(chatMessage, index))}
                      {agentTyping && renderTypingIndicator()}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <MessageOutlined className="text-4xl text-gray-400 mb-4" />
                  <Title level={4} className="text-gray-600 mb-2" style={{ fontFamily: 'Gilroy-Bold' }}>
                    Welcome to Support!
                  </Title>
                  <Text className="text-gray-500" style={{ fontFamily: 'Gilroy-Medium' }}>
                    Start a conversation with our support team. We're here to help!
                  </Text>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t bg-gray-50">
            {isLoading && (
              <div className="mb-2 text-center">
                <Spin size="small" />
                <Text className="ml-2 text-xs text-gray-500" style={{ fontFamily: 'Gilroy-Medium' }}>
                  {currentTicket ? 'Sending...' : 'Starting chat...'}
                </Text>
              </div>
            )}
            
            <div className="flex space-x-2">
              <TextArea
                ref={chatInputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onPressEnter={handleKeyPress}
                placeholder={
                  currentTicket 
                    ? "Type your message..." 
                    : "Describe your issue to start a conversation..."
                }
                disabled={isLoading || !isConnected}
                autoSize={{ minRows: 1, maxRows: 3 }}
                className="flex-1"
                style={{ fontFamily: 'Gilroy-Regular' }}
              />
              <Button 
                type="primary"
                icon={<SendOutlined />}
                onClick={currentTicket ? sendMessage : startNewChat}
                disabled={!newMessage.trim() || isLoading || !isConnected}
                style={{ 
                  backgroundColor: '#F6921E', 
                  borderColor: '#F6921E',
                  fontFamily: 'Gilroy-Bold'
                }}
              >
                Send
              </Button>
            </div>
            
            {currentTicket && currentTicket.status === 'closed' && (
              <div className="mt-2 text-center">
                <Text className="text-xs text-gray-500" style={{ fontFamily: 'Gilroy-Regular' }}>
                  This conversation has been closed. Start a new chat for additional support.
                </Text>
              </div>
            )}
          </div>
        </>
      )}

      {/* Chat History Drawer */}
      <Drawer
        title={
          <div className="flex items-center">
            <HistoryOutlined className="mr-2" style={{ color: '#F6921E' }} />
            <span style={{ fontFamily: 'Gilroy-Bold', color: '#333' }}>Chat History</span>
          </div>
        }
        placement="right"
        size="large"
        open={showHistoryDrawer}
        onClose={() => {
          setShowHistoryDrawer(false);
          setSelectedHistoryChat(null);
        }}
        className="history-drawer"
      >
        {chatHistory.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ fontFamily: 'Gilroy-Medium', color: '#666' }}>
                No chat history found
              </span>
            }
          />
        ) : (
          <div className="space-y-4">
            {selectedHistoryChat ? (
              // Show detailed view of selected chat
              <div>
                <div className="flex items-center mb-4">
                  <Button 
                    type="link" 
                    onClick={() => setSelectedHistoryChat(null)}
                    style={{ fontFamily: 'Gilroy-Medium', padding: 0 }}
                  >
                    ← Back to History
                  </Button>
                </div>
                
                <Card 
                  title={
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getStatusIcon(selectedHistoryChat.status)}
                        <span className="ml-2" style={{ fontFamily: 'Gilroy-Bold' }}>
                          {selectedHistoryChat.ticketNumber}
                        </span>
                      </div>
                      <Tag color={getStatusColor(selectedHistoryChat.status)}>
                        {selectedHistoryChat.status.replace('_', ' ').toUpperCase()}
                      </Tag>
                    </div>
                  }
                  className="mb-4"
                >
                  <div className="space-y-2 mb-4">
                    <div><strong style={{ fontFamily: 'Gilroy-Medium' }}>Subject:</strong> {selectedHistoryChat.subject}</div>
                    <div><strong style={{ fontFamily: 'Gilroy-Medium' }}>Category:</strong> {selectedHistoryChat.category}</div>
                    <div><strong style={{ fontFamily: 'Gilroy-Medium' }}>Priority:</strong> {selectedHistoryChat.priority}</div>
                    <div><strong style={{ fontFamily: 'Gilroy-Medium' }}>Created:</strong> {formatDate(selectedHistoryChat.createdAt)}</div>
                    {selectedHistoryChat.assignedTo && (
                      <div><strong style={{ fontFamily: 'Gilroy-Medium' }}>Assigned to:</strong> {selectedHistoryChat.assignedTo.fullName}</div>
                    )}
                    {selectedHistoryChat.resolution && (
                      <div className="mt-3 p-3 bg-green-50 rounded">
                        <div><strong style={{ fontFamily: 'Gilroy-Medium' }}>Resolution:</strong></div>
                        <div style={{ fontFamily: 'Gilroy-Regular' }}>{selectedHistoryChat.resolution.summary}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Resolved by {selectedHistoryChat.resolution.resolvedBy} on {formatDate(selectedHistoryChat.resolution.resolvedAt)}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {selectedHistoryChat.status !== 'closed' && (
                    <Button 
                      type="primary" 
                      onClick={() => reopenChatFromHistory(selectedHistoryChat)}
                      style={{ 
                        backgroundColor: '#F6921E', 
                        borderColor: '#F6921E',
                        fontFamily: 'Gilroy-Bold',
                        marginBottom: 16
                      }}
                    >
                      Continue Conversation
                    </Button>
                  )}
                </Card>

                {/* Messages */}
                <div className="bg-gray-50 rounded p-4 max-h-96 overflow-y-auto">
                  <div className="text-sm font-medium mb-3" style={{ fontFamily: 'Gilroy-Bold' }}>Messages ({selectedHistoryChat.messages.length})</div>
                  {selectedHistoryChat.messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      <MessageOutlined className="text-2xl mb-2" />
                      <div style={{ fontFamily: 'Gilroy-Medium' }}>No messages in this conversation</div>
                    </div>
                  ) : (
                    selectedHistoryChat.messages.map((msg, index) => renderHistoryMessage(msg, index))
                  )}
                </div>
              </div>
            ) : (
              // Show list of chat history
              <List
                dataSource={chatHistory}
                renderItem={(chat) => (
                  <List.Item
                    className="cursor-pointer hover:bg-gray-50 rounded p-3 transition-colors"
                    onClick={() => setSelectedHistoryChat(chat)}
                  >
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {getStatusIcon(chat.status)}
                          <span className="ml-2 font-medium" style={{ fontFamily: 'Gilroy-Bold' }}>
                            {chat.ticketNumber}
                          </span>
                        </div>
                        <Tag color={getStatusColor(chat.status)} className="text-xs">
                          {chat.status.replace('_', ' ').toUpperCase()}
                        </Tag>
                      </div>
                      
                      <div className="text-sm text-gray-700 mb-1" style={{ fontFamily: 'Gilroy-Medium' }}>
                        {chat.subject || 'Support Request'}
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-2" style={{ fontFamily: 'Gilroy-Regular' }}>
                        Category: {chat.category} | Priority: {chat.priority}
                      </div>
                      
                      {chat.messages.length > 0 && (
                        <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded mb-2" style={{ fontFamily: 'Gilroy-Regular' }}>
                          <div className="flex items-center text-xs text-gray-500 mb-1">
                            {chat.messages[chat.messages.length - 1].isAdminReply ? (
                              <CustomerServiceOutlined className="mr-1" />
                            ) : (
                              <UserOutlined className="mr-1" />
                            )}
                            Last message:
                          </div>
                          {chat.messages[chat.messages.length - 1].message.substring(0, 100)}
                          {chat.messages[chat.messages.length - 1].message.length > 100 && '...'}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Messages: {chat.messages.length}</span>
                        <span>{formatDate(chat.createdAt)}</span>
                      </div>
                      
                      {chat.assignedTo && (
                        <div className="text-xs text-blue-600 mt-1" style={{ fontFamily: 'Gilroy-Medium' }}>
                          Assigned to: {chat.assignedTo.fullName}
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: false,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} conversations`
                }}
              />
            )}
          </div>
        )}
      </Drawer>

      {/* Hidden Audio Element for Notifications */}
      <audio 
        ref={notificationAudioRef} 
        preload="auto" 
        style={{ display: 'none' }}
      >
        <source src="/src/assets/audio/notification-alert.mp3" type="audio/mpeg" />
        <source src="src/assets/audio/notification-alert.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default EnhancedUserChatWidget;