// Enhanced Admin Chat Dashboard with comprehensive management
import React, { useState, useEffect, useRef } from 'react';
import { 
  Table, 
  Input, 
  Button, 
  Card, 
  Tag, 
  Avatar, 
  Typography, 
  Space, 
  Divider,
  Badge,
  Select,
  Row,
  Col,
  Spin,
  message,
  Modal,
  Tooltip,
  Dropdown,
  MenuProps
} from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  UserOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  MoreOutlined,
  BellOutlined,
  TeamOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import EnhancedChatSocketService from '../../services/EnhancedChatSocketService';
import EnhancedChatAPI from '../../services/EnhancedChatAPI';
import { ChatMessage, ChatTicket, ChatStats } from '../../types/enhanced-chat.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

interface EnhancedAdminChatDashboardProps {
  adminToken: string;
}

const EnhancedAdminChatDashboard: React.FC<EnhancedAdminChatDashboardProps> = ({ adminToken }) => {
  // State management
  const [activeChats, setActiveChats] = useState<ChatTicket[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatTicket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<ChatStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    waitingForUser: 0,
    closed: 0
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adminToken) {
      initializeAdminChat();
    }

    return () => {
      EnhancedChatSocketService.disconnect();
    };
  }, [adminToken]);

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Connection events
    unsubscribers.push(
      EnhancedChatSocketService.on('connection_status', ({ connected }: any) => {
        setIsConnected(connected);
      })
    );

    // New chat notifications
    unsubscribers.push(
      EnhancedChatSocketService.on('new_chat_ticket', (ticket: ChatTicket) => {
        console.log('🆕 New chat ticket:', ticket);
        setActiveChats(prev => [ticket, ...prev]);
        updateStats();
        message.info(`New chat ticket: ${ticket.ticketNumber}`);
      })
    );

    // Real-time message events
    unsubscribers.push(
      EnhancedChatSocketService.on('new_message', (chatMessage: ChatMessage) => {
        console.log('💬 Admin received message:', chatMessage);
        
        // Update messages if it's for selected chat
        if (selectedChat && chatMessage.ticketId === selectedChat._id) {
          setMessages(prev => {
            const exists = prev.find(m => m._id === chatMessage._id);
            if (!exists) {
              // Remove pending messages and add confirmed
              const filteredPrev = prev.filter(m => 
                !(m.pending && m.message === chatMessage.message && m.isAdminReply)
              );
              return [...filteredPrev, chatMessage];
            }
            return prev;
          });
          scrollToBottom();
        }
        
        // Update chat in the list
        setActiveChats(prev => prev.map(chat => {
          if (chat._id === chatMessage.ticketId) {
            return { 
              ...chat, 
              messages: [...(chat.messages || []), chatMessage],
              lastUpdated: new Date(),
              hasNewMessage: selectedChat?._id !== chatMessage.ticketId
            };
          }
          return chat;
        }));
      })
    );

    // User typing events
    unsubscribers.push(
      EnhancedChatSocketService.on('user_typing', (data: any) => {
        if (selectedChat && data.ticketId === selectedChat._id) {
          setUserTyping(data.isTyping);
        }
      })
    );

    // User message notifications
    unsubscribers.push(
      EnhancedChatSocketService.on('user_message_notification', (data: any) => {
        message.info(`New message from ${data.userName || 'User'}`);
        updateChatInList(data.ticketId, { hasNewMessage: true });
      })
    );

    // Chat status updates
    unsubscribers.push(
      EnhancedChatSocketService.on('ticket_status_updated', (data: any) => {
        updateChatInList(data.ticketId, { status: data.status });
        if (selectedChat && selectedChat._id === data.ticketId) {
          setSelectedChat(prev => prev ? { ...prev, status: data.status } : null);
        }
      })
    );

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [selectedChat]);

  const initializeAdminChat = async () => {
    try {
      setIsLoading(true);
      console.log('🔌 Initializing admin chat service...');
      await EnhancedChatSocketService.connect(adminToken, 'admin');
      await loadActiveChats();
    } catch (error) {
      console.error('Failed to initialize admin chat:', error);
      message.error('Failed to connect to chat service');
    } finally {
      setIsLoading(false);
    }
  };

  const loadActiveChats = async () => {
    try {
      const result = await EnhancedChatAPI.getAdminActiveChats(filter);
      if (result.success) {
        setActiveChats(result.data.chats || []);
        updateStats(result.data.chats || []);
      }
    } catch (error) {
      console.error('Failed to load active chats:', error);
      message.error('Failed to load chats');
    }
  };

  const updateStats = (chats: ChatTicket[] = activeChats) => {
    const newStats = chats.reduce((acc, chat) => {
      acc.total++;
      switch (chat.status) {
        case 'open': acc.open++; break;
        case 'in_progress': acc.inProgress++; break;
        case 'waiting_for_user': acc.waitingForUser++; break;
        case 'closed': acc.closed++; break;
      }
      return acc;
    }, { total: 0, open: 0, inProgress: 0, waitingForUser: 0, closed: 0 });
    
    setStats(newStats);
  };

  const selectChat = async (chat: ChatTicket) => {
    try {
      setSelectedChat(chat);
      setMessages(chat.messages || []);
      setIsChatModalVisible(true);
      
      // Join the chat as admin via API
      const result = await EnhancedChatAPI.joinChatAsAdmin(chat._id);
      
      if (result.success) {
        // Join via Socket.IO for real-time updates
        EnhancedChatSocketService.joinTicketAsAdmin(chat._id);
        
        // Update chat with server data
        const updatedChat: ChatTicket = {
          ...chat,
          userName: result.data.userName,
          userEmail: result.data.userEmail,
          messages: result.data.messages || chat.messages,
          status: (result.data.status as any) || chat.status,
        };
        
        setSelectedChat(updatedChat);
        setMessages(result.data.messages || chat.messages || []);
        
        // Mark as no new messages
        updateChatInList(chat._id, { hasNewMessage: false });
        
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to join chat:', error);
      message.error('Failed to join chat');
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    const messageText = newMessage.trim();
    setNewMessage('');
    
    // Add to local state immediately
    const tempMessage: ChatMessage = {
      ticketId: selectedChat._id,
      message: messageText,
      isAdminReply: true,
      timestamp: new Date(),
      senderName: 'You (Admin)',
      pending: true
    };
    
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();
    
    // Send via Socket.IO for real-time delivery
    EnhancedChatSocketService.sendMessage(selectedChat._id, messageText);
  };

  const closeChat = async () => {
    if (!selectedChat) return;
    
    Modal.confirm({
      title: 'Close Chat',
      content: 'Are you sure you want to close this chat? Please provide a resolution summary.',
      onOk: async () => {
        const resolutionSummary = await new Promise<string>((resolve) => {
          let summary = '';
          Modal.confirm({
            title: 'Resolution Summary',
            content: (
              <TextArea
                placeholder="Enter resolution summary (optional)"
                onChange={(e) => summary = e.target.value}
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            ),
            onOk: () => resolve(summary),
            onCancel: () => resolve('')
          });
        });
        
        try {
          await EnhancedChatAPI.closeChatAsAdmin(selectedChat._id, resolutionSummary);
          EnhancedChatSocketService.closeChatAsAdmin(selectedChat._id, resolutionSummary);
          
          // Update chat status instead of removing
          setActiveChats(prev => prev.map(chat => 
            chat._id === selectedChat._id 
              ? { ...chat, status: 'closed' }
              : chat
          ));
          
          setSelectedChat(prev => prev ? { ...prev, status: 'closed' } : null);
          message.success('Chat closed successfully');
        } catch (error) {
          console.error('Failed to close chat:', error);
          message.error('Failed to close chat');
        }
      }
    });
  };

  const bulkCloseChats = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select chats to close');
      return;
    }
    
    Modal.confirm({
      title: `Close ${selectedRowKeys.length} chats?`,
      content: 'This action will close all selected chats. Please provide a resolution summary.',
      onOk: async () => {
        try {
          await EnhancedChatAPI.bulkCloseChats(selectedRowKeys, 'Bulk closed by admin');
          message.success(`${selectedRowKeys.length} chats closed successfully`);
          setSelectedRowKeys([]);
          loadActiveChats();
        } catch (error) {
          console.error('Failed to bulk close chats:', error);
          message.error('Failed to close chats');
        }
      }
    });
  };

  const updateChatInList = (chatId: string, updates: Partial<ChatTicket>) => {
    setActiveChats(prev => prev.map(chat => 
      chat._id === chatId ? { ...chat, ...updates } : chat
    ));
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatTime = (timestamp: Date | string) => {
    return dayjs(timestamp).format('HH:mm');
  };

  const formatDate = (timestamp: Date | string) => {
    return dayjs(timestamp).format('MMM DD, YYYY HH:mm');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'open': 'blue',
      'in_progress': 'orange',
      'waiting_for_user': 'gold',
      'closed': 'green'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'high': 'red',
      'medium': 'orange',
      'low': 'green'
    };
    return colors[priority as keyof typeof colors] || 'default';
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

  const filteredChats = activeChats.filter(chat => {
    const matchesFilter = filter === 'all' || chat.status === filter;
    const matchesSearch = !searchQuery || 
      chat.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.userId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const bulkActions: MenuProps['items'] = [
    {
      key: 'close',
      label: 'Close Selected Chats',
      icon: <CloseCircleOutlined />,
      onClick: bulkCloseChats
    },
    {
      key: 'assign',
      label: 'Assign Agent',
      icon: <TeamOutlined />,
      onClick: () => message.info('Assign agent functionality coming soon')
    }
  ];

  const columns: ColumnsType<ChatTicket> = [
    {
      title: 'Ticket',
      dataIndex: 'ticketNumber',
      key: 'ticketNumber',
      render: (text: string, record: ChatTicket) => (
        <div className="flex items-center">
          {getStatusIcon(record.status)}
          <div className="ml-2">
            <Text strong style={{ fontFamily: 'Gilroy-Bold' }}>{text}</Text>
            {record.hasNewMessage && (
              <Badge count="New" size="small" className="ml-2" />
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'User',
      key: 'user',
      render: (_, record: ChatTicket) => (
        <div className="flex items-center">
          <Avatar size="small" icon={<UserOutlined />} className="mr-2" />
          <div>
            <Text strong style={{ fontFamily: 'Gilroy-Medium' }}>
              {record.userName || record.userId?.fullName || 'Unknown User'}
            </Text>
            <br />
            <Text type="secondary" className="text-xs" style={{ fontFamily: 'Gilroy-Regular' }}>
              {record.userEmail || record.userId?.email || 'No email'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ fontFamily: 'Gilroy-Medium' }}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)} style={{ fontFamily: 'Gilroy-Medium' }}>
          {priority.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Messages',
      key: 'messages',
      render: (_, record: ChatTicket) => (
        <Text style={{ fontFamily: 'Gilroy-Regular' }}>
          {record.messages?.length || 0}
        </Text>
      ),
    },
    {
      title: 'Last Updated',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (date: Date) => (
        <Text className="text-xs" style={{ fontFamily: 'Gilroy-Regular' }}>
          {formatDate(date)}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: ChatTicket) => (
        <Space>
          <Tooltip title="Join Chat">
            <Button 
              type="primary" 
              size="small"
              icon={<MessageOutlined />}
              onClick={() => selectChat(record)}
              style={{ 
                backgroundColor: '#F6921E', 
                borderColor: '#F6921E',
                fontFamily: 'Gilroy-Bold'
              }}
            >
              Join
            </Button>
          </Tooltip>
          <Dropdown menu={{ items: [
            {
              key: 'close',
              label: 'Close Chat',
              icon: <CloseCircleOutlined />,
              onClick: () => {
                setSelectedChat(record);
                closeChat();
              }
            }
          ]}} trigger={['click']}>
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const renderMessage = (chatMessage: ChatMessage, index: number) => (
    <div 
      key={index} 
      className={`flex ${chatMessage.isAdminReply ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-md px-4 py-2 rounded-lg ${
        chatMessage.isAdminReply 
          ? 'text-white' 
          : 'bg-gray-100 text-gray-800'
      } ${chatMessage.pending ? 'opacity-60' : ''}`}
      style={{
        backgroundColor: chatMessage.isAdminReply ? '#F6921E' : undefined
      }}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-medium ${
            chatMessage.isAdminReply ? 'text-orange-100' : 'text-gray-600'
          }`} style={{ fontFamily: 'Gilroy-Medium' }}>
            {chatMessage.isAdminReply ? 'You (Admin)' : (chatMessage.senderName || 'Customer')}
          </span>
          <span className={`text-xs ${
            chatMessage.isAdminReply ? 'text-orange-100' : 'text-gray-500'
          }`} style={{ fontFamily: 'Gilroy-Regular' }}>
            {formatTime(chatMessage.timestamp)}
          </span>
        </div>
        <div className="whitespace-pre-wrap" style={{ fontFamily: 'Gilroy-Regular' }}>
          {chatMessage.message}
        </div>
        {chatMessage.pending && (
          <div className={`text-xs mt-1 ${
            chatMessage.isAdminReply ? 'text-orange-200' : 'text-gray-400'
          }`} style={{ fontFamily: 'Gilroy-Regular' }}>
            Sending...
          </div>
        )}
      </div>
    </div>
  );

  const renderUserTypingIndicator = () => (
    <div className="flex justify-start mb-4">
      <div className="max-w-xs px-4 py-2 bg-gray-100 rounded-lg">
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2" style={{ fontFamily: 'Gilroy-Medium' }}>
            Customer is typing
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

  return (
    <div className="p-6" style={{ fontFamily: 'Gilroy-Regular' }}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Title level={2} style={{ fontFamily: 'Gilroy-Bold', color: '#333333' }}>
              Support Chat Dashboard
            </Title>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <Text className={isConnected ? 'text-green-600' : 'text-red-600'} style={{ fontFamily: 'Gilroy-Medium' }}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Text>
              {!isConnected && (
                <Button 
                  type="link" 
                  size="small" 
                  icon={<ReloadOutlined />} 
                  onClick={initializeAdminChat}
                  className="ml-2"
                >
                  Reconnect
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Search
              placeholder="Search tickets, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
            />
            <Button 
              onClick={loadActiveChats}
              loading={isLoading}
              icon={<ReloadOutlined />}
              style={{ fontFamily: 'Gilroy-Medium' }}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card className="text-center">
              <Title level={3} className="mb-0" style={{ color: '#333333', fontFamily: 'Gilroy-Bold' }}>
                {stats.total}
              </Title>
              <Text className="text-gray-600" style={{ fontFamily: 'Gilroy-Medium' }}>Total Chats</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="text-center">
              <Title level={3} className="mb-0" style={{ color: '#1890ff', fontFamily: 'Gilroy-Bold' }}>
                {stats.open}
              </Title>
              <Text className="text-gray-600" style={{ fontFamily: 'Gilroy-Medium' }}>New</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="text-center">
              <Title level={3} className="mb-0" style={{ color: '#F6921E', fontFamily: 'Gilroy-Bold' }}>
                {stats.inProgress}
              </Title>
              <Text className="text-gray-600" style={{ fontFamily: 'Gilroy-Medium' }}>In Progress</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="text-center">
              <Title level={3} className="mb-0" style={{ color: '#52c41a', fontFamily: 'Gilroy-Bold' }}>
                {stats.closed}
              </Title>
              <Text className="text-gray-600" style={{ fontFamily: 'Gilroy-Medium' }}>Closed Today</Text>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Chat Table */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <Title level={4} className="mb-0" style={{ fontFamily: 'Gilroy-Bold' }}>
              Active Chats ({filteredChats.length})
            </Title>
            <div className="flex items-center space-x-2">
              <Select
                value={filter}
                onChange={setFilter}
                style={{ width: 140 }}
                size="small"
              >
                <Option value="all">All Status</Option>
                <Option value="open">New</Option>
                <Option value="in_progress">In Progress</Option>
                <Option value="waiting_for_user">Waiting</Option>
                <Option value="closed">Closed</Option>
              </Select>
              
              {selectedRowKeys.length > 0 && (
                <Dropdown menu={{ items: bulkActions }} trigger={['click']}>
                  <Button size="small">
                    Bulk Actions ({selectedRowKeys.length}) <MoreOutlined />
                  </Button>
                </Dropdown>
              )}
            </div>
          </div>
        }
        className="mb-6"
      >
        <Table
          columns={columns}
          dataSource={filteredChats}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} chats`
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as string[]),
            getCheckboxProps: (record) => ({
              disabled: record.status === 'closed'
            })
          }}
          size="small"
        />
      </Card>

      {/* Chat Modal */}
      <Modal
        title={
          selectedChat && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar icon={<UserOutlined />} className="mr-2" />
                <div>
                  <Text strong style={{ fontFamily: 'Gilroy-Bold' }}>
                    {selectedChat.userName || selectedChat.userId?.fullName || 'Unknown User'}
                  </Text>
                  <br />
                  <Text type="secondary" className="text-xs" style={{ fontFamily: 'Gilroy-Regular' }}>
                    {selectedChat.ticketNumber} • {selectedChat.userEmail || selectedChat.userId?.email}
                  </Text>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Tag color={getStatusColor(selectedChat.status)} style={{ fontFamily: 'Gilroy-Medium' }}>
                  {selectedChat.status.replace('_', ' ').toUpperCase()}
                </Tag>
                {selectedChat.status !== 'closed' && (
                  <Button
                    danger
                    size="small"
                    icon={<CloseCircleOutlined />}
                    onClick={closeChat}
                    style={{ fontFamily: 'Gilroy-Medium' }}
                  >
                    Close Chat
                  </Button>
                )}
              </div>
            </div>
          )
        }
        open={isChatModalVisible}
        onCancel={() => {
          setIsChatModalVisible(false);
          setSelectedChat(null);
          setMessages([]);
        }}
        width={600}
        height={600}
        footer={
          selectedChat && selectedChat.status !== 'closed' && (
            <div className="flex space-x-2">
              <TextArea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your response..."
                autoSize={{ minRows: 1, maxRows: 3 }}
                disabled={!isConnected}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                style={{ fontFamily: 'Gilroy-Regular' }}
              />
              <Button 
                type="primary"
                icon={<SendOutlined />}
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isConnected}
                style={{ 
                  backgroundColor: '#F6921E', 
                  borderColor: '#F6921E',
                  fontFamily: 'Gilroy-Bold'
                }}
              >
                Send
              </Button>
            </div>
          )
        }
      >
        {/* Chat Messages */}
        <div 
          className="overflow-y-auto p-4" 
          style={{ height: '400px', backgroundColor: '#fafafa' }}
        >
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <MessageOutlined className="text-4xl mb-2" />
              <div style={{ fontFamily: 'Gilroy-Medium' }}>No messages yet</div>
            </div>
          ) : (
            <>
              {messages.map((chatMessage, index) => renderMessage(chatMessage, index))}
              {userTyping && renderUserTypingIndicator()}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </Modal>
    </div>
  );
};

export default EnhancedAdminChatDashboard;