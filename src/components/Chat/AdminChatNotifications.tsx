import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, List, Button, Empty, Avatar, Typography } from 'antd';
import { MessageOutlined, UserOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import ChatSocketService from '../../services/ChatSocketService';
import { retrieveTokenFromStorage } from '../../helpers';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

interface ChatNotification {
  id: string;
  ticketId: string;
  userName: string;
  userEmail: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface AdminChatNotificationsProps {
  className?: string;
}

const AdminChatNotifications: React.FC<AdminChatNotificationsProps> = ({ className }) => {
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getToken = async () => {
      const retrievedToken = await retrieveTokenFromStorage();
      setToken(retrievedToken);
    };
    getToken();
  }, []);

  useEffect(() => {
    if (!token) return;

    // Connect to admin socket for notifications
    ChatSocketService.connect(token, 'admin');

    const handleNewChatTicket = (data: any) => {
      const notification: ChatNotification = {
        id: `${data.ticketId}-${Date.now()}`,
        ticketId: data.ticketId,
        userName: data.userName,
        userEmail: data.userEmail,
        message: data.message,
        timestamp: data.createdAt,
        isRead: false
      };

      setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only 10 notifications
      setUnreadCount(prev => prev + 1);
    };

    const handleUserMessage = (data: any) => {
      const notification: ChatNotification = {
        id: `${data.ticketId}-${Date.now()}`,
        ticketId: data.ticketId,
        userName: data.userName || 'User',
        userEmail: data.userEmail || '',
        message: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
        isRead: false
      };

      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      setUnreadCount(prev => prev + 1);
    };

    // Handle new_message events - filter for user messages (non-@mydeeptech.ng emails)
    const handleNewMessage = (data: any) => {
      // Use email to identify if it's a user message (NOT @mydeeptech.ng domain)
      const senderEmail = data.senderEmail || data.userEmail || '';
      const isFromAdmin = senderEmail.includes('@mydeeptech.ng');

      // Only create notifications for user messages (non-admin)
      if (!isFromAdmin) {
        const notification: ChatNotification = {
          id: `${data.ticketId || data._id}-${Date.now()}`,
          ticketId: data.ticketId || data._id,
          userName: data.senderName || data.userName || 'User',
          userEmail: senderEmail,
          message: data.message,
          timestamp: data.timestamp || new Date().toISOString(),
          isRead: false
        };

        // Check for duplicates before adding
        setNotifications(prev => {
          const exists = prev.find(n =>
            n.ticketId === notification.ticketId &&
            n.message === notification.message &&
            Math.abs(new Date(n.timestamp).getTime() - new Date(notification.timestamp).getTime()) < 2000
          );

          if (!exists) {
            setUnreadCount(prevCount => prevCount + 1);
            return [notification, ...prev.slice(0, 9)];
          }

          return prev;
        });
      }
    };

    ChatSocketService.on('new_chat_ticket', handleNewChatTicket);
    ChatSocketService.on('user_message', handleUserMessage);
    ChatSocketService.on('new_message', handleNewMessage);

    return () => {
      ChatSocketService.off('new_chat_ticket', handleNewChatTicket);
      ChatSocketService.off('user_message', handleUserMessage);
      ChatSocketService.off('new_message', handleNewMessage);
    };
  }, [token]);

  // Debug effect to track notifications
  useEffect(() => {
  }, [notifications, unreadCount]);

  const handleNotificationClick = (notification: ChatNotification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );

    // Decrease unread count
    if (!notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // Navigate to chat management
    navigate('/admin/chat');
    setIsOpen(false);
  };

  const handleViewAllChats = () => {
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    navigate('/admin/chat');
    setIsOpen(false);
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

  if (!token) return null;

  const dropdownContent = (
    <div className="w-80 bg-white rounded-lg shadow-lg border">
      <div className="p-4 border-b bg-gradient-to-r from-[#333333] to-[#F6921E] text-white">
        <Text className="font-['gilroy-semibold'] text-white">Chat Notifications</Text>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <Empty
            description="No new chat notifications"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="py-8"
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(notification) => (
              <motion.div
                whileHover={{ backgroundColor: '#f8f9fa' }}
                transition={{ duration: 0.2 }}
              >
                <List.Item
                  className={`cursor-pointer px-4 py-3 border-l-4 ${!notification.isRead
                    ? 'border-l-[#F6921E] bg-orange-50'
                    : 'border-l-transparent'
                    }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot={!notification.isRead} offset={[-5, 5]}>
                        <Avatar
                          icon={<UserOutlined />}
                          style={{ backgroundColor: '#333333' }}
                          size="small"
                        />
                      </Badge>
                    }
                    title={
                      <div className="flex justify-between items-start">
                        <span className={`text-sm ${notification.isRead ? 'font-normal' : 'font-semibold'
                          }`}>
                          {notification.userName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                    }
                    description={
                      <div>
                        <div className="text-xs text-gray-600 mb-1">
                          {notification.userEmail}
                        </div>
                        <div className="text-sm text-gray-800 truncate">
                          {notification.message}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              </motion.div>
            )}
          />
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t bg-gray-50">
          <Button
            type="link"
            block
            onClick={handleViewAllChats}
            className="text-[#F6921E] font-['gilroy-medium']"
          >
            View All Chats
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      open={isOpen}
      onOpenChange={setIsOpen}
      placement="topRight"
      className={`${className} z-50`}
    >
      <Button
        type="text"
        className="flex size-8 items-center justify-center hover:bg-gray-100 transition-colors"
        style={{ color: '#333333' }}
      >
        <Badge count={unreadCount} size="small" offset={[8, -8]}>
          <MessageOutlined className="text-lg" />
        </Badge>
      </Button>
    </Dropdown>
  );
};

export default AdminChatNotifications;