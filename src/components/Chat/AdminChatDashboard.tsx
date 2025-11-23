import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  List,
  Avatar,
  Button,
  Input,
  Badge,
  Tag,
  message,
  Divider,
  Empty,
  Tooltip,
  Select,
  Space,
  Typography
} from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  CustomerServiceOutlined,
  ClockCircleOutlined,
  UserOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAdminChat } from '../../hooks/Chat/useAdminChat';
import ChatSocketService from '../../services/ChatSocketService';
import { ChatTicket, ChatMessage } from '../../types/chat.types';
import { apiPost } from '../../service/apiUtils';
import { endpoints } from '../../store/api/endpoints';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

interface AdminChatDashboardProps {
  adminToken: string;
}

const AdminChatDashboard: React.FC<AdminChatDashboardProps> = ({ adminToken }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [selectedChatMessages, setSelectedChatMessages] = useState<ChatMessage[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('active');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    loading,
    error,
    activeChats,
    selectedChat,
    getActiveChats,
    joinChat,
    closeChat,
    sendMessage: sendMessageAPI,
    setSelectedChat,
    updateChatInList,
    addMessageToSelectedChat
  } = useAdminChat();

  useEffect(() => {
    console.log('🔧 [AdminChatDashboard] Initializing with adminToken:', adminToken ? 'Present' : 'Missing');
    
    // Initialize socket connection
    console.log('🔌 [AdminChatDashboard] Connecting to chat socket as admin...');
    ChatSocketService.connect(adminToken, 'admin')
      .then(() => {
        console.log('✅ [AdminChatDashboard] Socket connection successful');
      })
      .catch((error) => {
        console.error('❌ [AdminChatDashboard] Socket connection failed:', error);
      });
    
    // Load initial data
    console.log('📋 [AdminChatDashboard] Loading initial chat data...');
    loadChats();

    // Socket event listeners
    ChatSocketService.on('connection_status', (data: { connected: boolean }) => {
      console.log('🔗 [AdminChatDashboard] Connection status changed:', data);
      setIsConnected(data.connected);
      if (data.connected) {
        console.log('🏠 [AdminChatDashboard] Joining admin room...');
        ChatSocketService.joinAdminRoom();
      }
    });

    ChatSocketService.on('new_chat_ticket', (data: any) => {
      console.log('🎫 [AdminChatDashboard] New chat ticket received:', data);
      message.info(`New chat from ${data.userName}`);
      loadChats(); // Refresh chat list
    });

    ChatSocketService.on('user_message', (data: any) => {
      console.log('👤 [AdminChatDashboard] User message received:', data);
      updateChatInList(data.ticketId, data.message);
      
      if (selectedChat?.ticketId === data.ticketId) {
        console.log('💬 [AdminChatDashboard] Adding message to selected chat:', selectedChat?.ticketId);
        const newMsg: ChatMessage = {
          _id: `msg-${Date.now()}`,
          sender: data.userId || 'user',
          senderModel: 'DTUser',
          senderName: data.userName,
          message: data.message,
          isAdminReply: false,
          timestamp: data.timestamp
        };
        
        setSelectedChatMessages(prev => [...prev, newMsg]);
        addMessageToSelectedChat(newMsg);
      }
    });

    // Add more socket event listeners for debugging
    ChatSocketService.on('message_sent', (data: any) => {
      console.log('✅ [AdminChatDashboard] Message sent confirmation:', data);
    });

    ChatSocketService.on('chat_error', (data: any) => {
      console.error('❌ [AdminChatDashboard] Chat error:', data);
      message.error(`Chat error: ${data.message || 'Unknown error'}`);
    });

    return () => {
      console.log('🔌 [AdminChatDashboard] Disconnecting socket...');
      ChatSocketService.disconnect();
    };
  }, [adminToken]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChatMessages]);

  const loadChats = async () => {
    console.log('📋 [AdminChatDashboard] Loading chats with filter:', statusFilter);
    try {
      const result = await getActiveChats(statusFilter);
      console.log('📋 [AdminChatDashboard] Chat loading result:', result);
      if (result.success) {
        console.log('✅ [AdminChatDashboard] Successfully loaded chats:', result.data);
      } else {
        console.error('❌ [AdminChatDashboard] Failed to load chats:', result.error);
      }
    } catch (error) {
      console.error('❌ [AdminChatDashboard] Error loading chats:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleJoinChat = async (chat: ChatTicket) => {
    console.log('🔗 [AdminChatDashboard] Attempting to join chat:', chat);
    try {
      const result = await joinChat(chat._id);
      console.log('🔗 [AdminChatDashboard] Join chat API result:', result);
      
      if (result.success && result.data) {
        console.log('✅ [AdminChatDashboard] Successfully joined chat, setting messages:', result.data.messages?.length || 0, 'messages');
        setSelectedChatMessages(result.data.messages || []);
        
        // Update the selected chat with user info from the response
        const updatedChat = {
          ...chat,
          userName: result.data.userName,
          userEmail: result.data.userEmail,
          ticketId: result.data.ticketId,
          status: result.data.status as any
        };
        console.log('👤 [AdminChatDashboard] Updated chat object:', updatedChat);
        setSelectedChat(updatedChat);
        
        // Join socket room for real-time updates using the ticketId from response
        if (isConnected) {
          console.log('🏠 [AdminChatDashboard] Joining socket room for ticket:', result.data.ticketId);
          ChatSocketService.joinChat(result.data.ticketId);
        } else {
          console.warn('⚠️ [AdminChatDashboard] Socket not connected, cannot join room');
        }
        
        message.success(`Joined chat with ${result.data.userName}`);
      } else {
        console.error('❌ [AdminChatDashboard] Join chat failed:', result.error);
        message.error(`Failed to join chat: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ [AdminChatDashboard] Join chat error:', error);
      message.error('Failed to join chat');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) {
      console.warn('⚠️ [AdminChatDashboard] Cannot send message: empty message or no selected chat');
      return;
    }

    const messageText = newMessage.trim();
    const ticketId = selectedChat.ticketId || selectedChat._id;
    console.log('📤 [AdminChatDashboard] Attempting to send message:', {
      message: messageText,
      ticketId,
      selectedChat: selectedChat,
      isConnected
    });

    const adminMessage: ChatMessage = {
      _id: `temp-${Date.now()}`,
      sender: 'admin',
      senderModel: 'Admin',
      senderName: 'You',
      message: messageText,
      isAdminReply: true,
      timestamp: new Date().toISOString()
    };

    console.log('➕ [AdminChatDashboard] Adding message to UI:', adminMessage);
    setSelectedChatMessages(prev => [...prev, adminMessage]);

    // Clear input immediately for better UX
    setNewMessage('');

    let socketSuccess = false;
    let apiSuccess = false;

    // Try socket first if connected
    if (isConnected && ChatSocketService.isSocketConnected()) {
      console.log('🔌 [AdminChatDashboard] Sending via Socket.IO to ticket:', ticketId);
      try {
        ChatSocketService.sendAdminMessage(ticketId, messageText);
        console.log('✅ [AdminChatDashboard] Socket message sent successfully');
        socketSuccess = true;
      } catch (socketError) {
        console.error('❌ [AdminChatDashboard] Socket send error:', socketError);
      }
    }

    // Always try API as well for reliability
    console.log('📡 [AdminChatDashboard] Sending message via API as backup/confirmation');
    try {
      const apiResult = await sendMessageAPI(ticketId, messageText);
      console.log('📡 [AdminChatDashboard] API send message result:', apiResult);
      
      if (apiResult.success) {
        console.log('✅ [AdminChatDashboard] Message sent via API successfully');
        apiSuccess = true;
      } else {
        console.error('❌ [AdminChatDashboard] API send failed:', apiResult.error);
      }
    } catch (apiError) {
      console.error('❌ [AdminChatDashboard] API send error:', apiError);
    }

    // Show user feedback based on results
    if (socketSuccess || apiSuccess) {
      if (socketSuccess && apiSuccess) {
        console.log('✅ [AdminChatDashboard] Message sent via both socket and API');
        // Don't show message to avoid spam - socket success is enough
      } else if (socketSuccess) {
        console.log('✅ [AdminChatDashboard] Message sent via socket only');
        message.success('Message sent (real-time)');
      } else if (apiSuccess) {
        console.log('✅ [AdminChatDashboard] Message sent via API only');
        message.success('Message sent (API)');
      }
    } else {
      console.error('❌ [AdminChatDashboard] Failed to send message via both socket and API');
      message.error('Failed to send message. Please check your connection.');
      
      // Optionally remove the message from UI if both failed
      setSelectedChatMessages(prev => prev.filter(msg => msg._id !== adminMessage._id));
    }
  };

  const handleCloseChat = async () => {
    if (!selectedChat) {
      console.warn('⚠️ [AdminChatDashboard] Cannot close chat: no selected chat');
      return;
    }

    console.log('🔒 [AdminChatDashboard] Attempting to close chat:', selectedChat._id);
    try {
      const result = await closeChat(selectedChat._id, {
        resolutionSummary: 'Chat session completed successfully'
      });
      
      console.log('🔒 [AdminChatDashboard] Close chat result:', result);
      
      if (result.success) {
        console.log('✅ [AdminChatDashboard] Chat closed successfully');
        message.success('Chat closed successfully');
        setSelectedChatMessages([]);
        setSelectedChat(null);
        
        // Also notify via socket if connected
        if (isConnected) {
          console.log('📡 [AdminChatDashboard] Notifying socket about chat closure');
          ChatSocketService.closeChat(selectedChat._id, 'Chat session completed successfully');
        }
        
        loadChats(); // Refresh chat list
      } else {
        console.error('❌ [AdminChatDashboard] Failed to close chat:', result.error);
        message.error(`Failed to close chat: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ [AdminChatDashboard] Close chat error:', error);
      message.error('Failed to close chat');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'blue';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'blue';
      case 'in_progress': return 'orange';
      case 'waiting_for_user': return 'purple';
      case 'resolved': return 'green';
      case 'closed': return 'gray';
      default: return 'blue';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 font-['gilroy-regular']">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="!text-[#333333] !mb-2 font-['gilroy-semibold']">
            Support Chat Dashboard
          </Title>
          <Text className="text-gray-600 font-['gilroy-regular']">
            Manage customer support conversations in real-time
          </Text>
        </div>
        
        <Space>
          <Select
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              getActiveChats(value);
            }}
            style={{ width: 120 }}
          >
            <Option value="active">Active</Option>
            <Option value="open">Open</Option>
            <Option value="in_progress">In Progress</Option>
            <Option value="all">All</Option>
          </Select>
          
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadChats}
            loading={loading}
          >
            Refresh
          </Button>
          
          <div className="flex items-center space-x-2">
            <div 
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-red-400'
              }`}
            />
            <span className={`text-sm font-['gilroy-medium'] ${
              isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </Space>
      </div>

      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Chat List */}
        <div className="col-span-4">
          <Card 
            title={
              <div className="flex items-center justify-between">
                <span className="font-['gilroy-semibold']">Active Chats ({activeChats.length})</span>
                <Badge 
                  count={activeChats.filter(chat => chat.status === 'open').length} 
                  style={{ backgroundColor: '#F6921E' }}
                />
              </div>
            }
            className="h-full"
            bodyStyle={{ padding: 0, height: 'calc(100% - 70px)', overflow: 'auto' }}
          >
            {activeChats.length === 0 ? (
              <Empty 
                description="No active chats"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                className="mt-16"
              />
            ) : (
              <List
                dataSource={activeChats}
                renderItem={(chat) => (
                  <motion.div
                    whileHover={{ backgroundColor: '#f8f9fa' }}
                    transition={{ duration: 0.2 }}
                  >
                    <List.Item
                      className={`cursor-pointer px-4 py-3 border-l-4 ${
                        selectedChat?._id === chat._id 
                          ? 'border-l-[#F6921E] bg-orange-50' 
                          : 'border-l-transparent'
                      }`}
                      onClick={() => handleJoinChat(chat)}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge dot={chat.status === 'open'} offset={[-5, 5]}>
                            <Avatar 
                              icon={<UserOutlined />} 
                              style={{ backgroundColor: '#333333' }}
                            />
                          </Badge>
                        }
                        title={
                          <div className="flex justify-between items-start">
                            <span className="font-['gilroy-semibold'] text-sm">
                              {chat.userId?.fullName || 'Unknown User'}
                            </span>
                            <div className="flex flex-col items-end space-y-1">
                              <Tag 
                                color={getPriorityColor(chat.priority || 'medium')}
                                className="text-xs"
                              >
                                {(chat.priority || 'medium').toUpperCase()}
                              </Tag>
                              <Tag 
                                color={getStatusColor(chat.status)}
                                className="text-xs"
                              >
                                {(chat.status || 'open').replace('_', ' ').toUpperCase()}
                              </Tag>
                            </div>
                          </div>
                        }
                        description={
                          <div>
                            <div className="text-xs text-gray-600 mb-1">
                              {chat.ticketNumber} • {(chat.category || 'general').replace('_', ' ')}
                            </div>
                            <div className="text-sm text-gray-800 truncate">
                              {chat.messages[chat.messages.length - 1]?.message || 'No messages yet'}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <ClockCircleOutlined className="mr-1" />
                              {formatTime(chat.lastUpdated)}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  </motion.div>
                )}
              />
            )}
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="col-span-8">
          <Card className="h-full" bodyStyle={{ padding: 0, height: '100%' }}>
            {selectedChat ? (
              <div className="flex flex-col h-full">
                {/* Chat Header */}
                <div 
                  className="px-6 py-4 border-b text-white"
                  style={{ background: 'linear-gradient(135deg, #333333 0%, #F6921E 100%)' }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <Avatar 
                        icon={<UserOutlined />} 
                        size={48}
                        style={{ backgroundColor: '#F6921E' }}
                      />
                      <div>
                        <h3 className="font-['gilroy-semibold'] text-lg mb-1">
                          {selectedChat.userName || selectedChat.userId?.fullName || 'Unknown User'}
                        </h3>
                        <div className="text-sm opacity-90">
                          {selectedChat.userEmail || selectedChat.userId?.email || 'No email'}
                        </div>
                        <div className="text-xs opacity-75">
                          {selectedChat.ticketNumber} • {(selectedChat.category || 'general').replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Tag color={getPriorityColor(selectedChat.priority || 'medium')}>
                        {(selectedChat.priority || 'medium').toUpperCase()}
                      </Tag>
                      <Tooltip title="Close Chat">
                        <Button
                          type="text"
                          icon={<CloseCircleOutlined />}
                          onClick={handleCloseChat}
                          className="text-white hover:bg-white/20"
                        />
                      </Tooltip>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  {selectedChatMessages.length === 0 ? (
                    <div className="text-center text-gray-500 py-16">
                      <MessageOutlined className="text-4xl mb-3 text-gray-400" />
                      <p className="font-['gilroy-medium']">No messages yet</p>
                      <p className="text-sm">Start the conversation to help this customer</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedChatMessages.map((msg) => (
                        <div key={msg._id} className={`flex ${msg.isAdminReply ? 'justify-end' : 'justify-start'}`}>
                          <div 
                            className={`max-w-md px-4 py-3 rounded-lg ${
                              msg.isAdminReply 
                                ? 'text-white shadow-sm' 
                                : 'bg-white text-gray-800 shadow-sm border'
                            }`}
                            style={{
                              backgroundColor: msg.isAdminReply ? '#F6921E' : '#ffffff'
                            }}
                          >
                            {!msg.isAdminReply && (
                              <div className="text-xs text-gray-500 mb-2 font-['gilroy-medium']">
                                {msg.senderName || selectedChat.userName || selectedChat.userId?.fullName || 'Customer'}
                              </div>
                            )}
                            <div className="text-sm font-['gilroy-regular'] leading-relaxed">
                              {msg.message}
                            </div>
                            <div 
                              className={`text-xs mt-2 ${
                                msg.isAdminReply ? 'text-orange-100' : 'text-gray-400'
                              }`}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                <Divider className="m-0" />

                {/* Message Input */}
                <div className="p-6 bg-white">
                  <div className="flex space-x-3">
                    <TextArea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your response..."
                      autoSize={{ minRows: 2, maxRows: 4 }}
                      className="flex-1"
                      disabled={!isConnected}
                    />
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || !isConnected}
                      style={{
                        backgroundColor: '#F6921E',
                        borderColor: '#F6921E'
                      }}
                      className="self-end"
                      size="large"
                    >
                      Send
                    </Button>
                  </div>
                  
                  {!isConnected && (
                    <div className="text-xs text-red-500 mt-3 flex items-center">
                      <LoadingOutlined className="mr-1" />
                      Connecting to chat server...
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <CustomerServiceOutlined className="text-6xl text-gray-400 mb-4" />
                  <h3 className="text-xl font-['gilroy-semibold'] text-gray-600 mb-2">
                    Select a chat to start helping
                  </h3>
                  <p className="text-gray-500">
                    Choose from the active chats on the left to begin assisting customers.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminChatDashboard;