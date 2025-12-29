import React, { useEffect, useState } from 'react';
import { 
  Card, 
  List, 
  Tag, 
  Button, 
  Typography, 
  Empty,
  Spin,
  message,
  Row,
  Col,
  Space
} from 'antd';
import {
  MessageOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useUserChat } from '../../../hooks/Chat/useUserChat';
import { ChatTicket } from '../../../types/chat.types';
import {toast} from "sonner";

const { Title, Text } = Typography;

const SupportCenter: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatTicket[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalChats, setTotalChats] = useState(0);
  
  const { 
    loading, 
    error, 
    getChatHistory 
  } = useUserChat();

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async (page = 1) => {
    try {
      const result = await getChatHistory(page, 10);
      if (result.success && result.data) {
        setChatHistory(result.data.chats);
        setTotalChats(result.data.pagination.totalChats);
        setCurrentPage(page);
      }
    } catch (error) {
      toast.error('Failed to load chat history');
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'blue';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 font-['gilroy-regular']">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <CustomerServiceOutlined className="text-6xl text-[#F6921E] mb-4" />
          <Title level={1} className="!text-[#333333] !mb-2 font-['gilroy-bold']">
            Support Center
          </Title>
          <Text className="text-lg text-gray-600 font-['gilroy-regular']">
            View your support conversations and get help when you need it
          </Text>
        </div>

        {/* Quick Actions */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} md={8}>
            <Card 
              className="text-center hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-dashed border-[#F6921E]"
              bodyStyle={{ padding: '24px' }}
            >
              <MessageOutlined className="text-4xl text-[#F6921E] mb-3" />
              <Title level={4} className="!text-[#333333] font-['gilroy-semibold']">
                Start New Chat
              </Title>
              <Text className="text-gray-600">
                Get instant help from our support team
              </Text>
              <div className="mt-4">
                <Text className="text-sm text-[#F6921E] font-['gilroy-medium']">
                  Click the chat button in the bottom right corner
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <ClockCircleOutlined className="text-4xl text-blue-500 mb-3" />
              <Title level={4} className="!text-[#333333] font-['gilroy-semibold']">
                Average Response Time
              </Title>
              <Text className="text-2xl font-['gilroy-bold'] text-blue-500">&lt; 5 min</Text>
              <div className="mt-2">
                <Text className="text-gray-600">During business hours</Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CustomerServiceOutlined className="text-4xl text-green-500 mb-3" />
              <Title level={4} className="!text-[#333333] font-['gilroy-semibold']">
                Support Hours
              </Title>
              <Text className="text-gray-600">
                24/7 Support Available
              </Text>
              <div className="mt-2">
                <Text className="text-sm text-green-500 font-['gilroy-medium']">
                  We're always here to help
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Chat History */}
        <Card 
          title={
            <div className="flex justify-between items-center">
              <span className="font-['gilroy-semibold'] text-[#333333]">Your Support History</span>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => loadChatHistory(currentPage)}
                loading={loading}
              >
                Refresh
              </Button>
            </div>
          }
          className="shadow-lg"
        >
          {loading ? (
            <div className="text-center py-16">
              <Spin size="large" />
              <div className="mt-4">
                <Text className="text-gray-600">Loading your chat history...</Text>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <Text className="text-red-500">{error}</Text>
              <div className="mt-4">
                <Button onClick={() => loadChatHistory()} type="primary">
                  Try Again
                </Button>
              </div>
            </div>
          ) : chatHistory.length === 0 ? (
            <Empty 
              description={
                <div>
                  <p className="text-gray-600 font-['gilroy-medium'] mb-2">
                    No support conversations yet
                  </p>
                  <p className="text-sm text-gray-500">
                    Start a conversation using the chat button to get help from our support team
                  </p>
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="py-16"
            />
          ) : (
            <List
              dataSource={chatHistory}
              pagination={{
                current: currentPage,
                total: totalChats,
                pageSize: 10,
                onChange: (page) => loadChatHistory(page),
                showSizeChanger: false
              }}
              renderItem={(chat, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <List.Item className="hover:bg-gray-50 transition-colors rounded p-4 mb-2">
                    <List.Item.Meta
                      title={
                        <div className="flex justify-between items-start">
                          <Space direction="vertical" size={4}>
                            <Text className="font-['gilroy-semibold'] text-[#333333]">
                              {chat.subject}
                            </Text>
                            <Text className="text-sm text-gray-600">
                              Ticket #{chat.ticketNumber}
                            </Text>
                          </Space>
                          <Space>
                            <Tag color={getPriorityColor(chat.priority || 'low')}>
                              {(chat.priority || 'low').toUpperCase()}
                            </Tag>
                            <Tag color={getStatusColor(chat.status)}>
                              {chat.status.replace('_', ' ').toUpperCase()}
                            </Tag>
                          </Space>
                        </div>
                      }
                      description={
                        <div className="mt-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Text className="text-xs text-gray-500 uppercase tracking-wide">Category</Text>
                              <div className="text-sm text-gray-700 font-['gilroy-medium']">
                                {chat.category?.replace('_', ' ') || 'General'}
                              </div>
                            </div>
                            <div>
                              <Text className="text-xs text-gray-500 uppercase tracking-wide">Created</Text>
                              <div className="text-sm text-gray-700 font-['gilroy-medium']">
                                {formatDate(chat.createdAt)}
                              </div>
                            </div>
                            <div>
                              <Text className="text-xs text-gray-500 uppercase tracking-wide">Last Updated</Text>
                              <div className="text-sm text-gray-700 font-['gilroy-medium']">
                                {formatDate(chat.lastUpdated)}
                              </div>
                            </div>
                          </div>
                          
                          {chat.messages.length > 0 && (
                            <div className="mt-4 p-3 bg-gray-50 rounded">
                              <Text className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
                                Last Message
                              </Text>
                              <Text className="text-sm text-gray-700">
                                {chat.messages[chat.messages.length - 1].message.length > 100
                                  ? `${chat.messages[chat.messages.length - 1].message.substring(0, 100)}...`
                                  : chat.messages[chat.messages.length - 1].message}
                              </Text>
                            </div>
                          )}
                          
                          {chat.assignedTo && (
                            <div className="mt-3">
                              <Text className="text-xs text-gray-500 uppercase tracking-wide">Assigned Agent</Text>
                              <div className="text-sm text-gray-700 font-['gilroy-medium']">
                                {chat.assignedTo.fullName}
                              </div>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                </motion.div>
              )}
            />
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default SupportCenter;