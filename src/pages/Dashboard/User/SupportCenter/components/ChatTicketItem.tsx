import React from 'react';
import { List, Typography, Space, Tag } from 'antd';
import { motion } from 'framer-motion';
import { ChatTicket } from '../../../../../types/chat.types';
import { getStatusColor, getPriorityColor, formatDate, ANIMATIONS, STYLES } from '../utilities/constants';

const { Text } = Typography;

interface ChatTicketItemProps {
  chat: ChatTicket;
  index: number;
}

const ChatTicketItem: React.FC<ChatTicketItemProps> = ({ chat, index }) => {
  const lastMessage = chat.messages[chat.messages.length - 1];
  const truncatedMessage = lastMessage?.message.length > 100 
    ? `${lastMessage.message.substring(0, 100)}...`
    : lastMessage?.message;

  return (
    <motion.div
      initial={ANIMATIONS.listItem.initial}
      animate={ANIMATIONS.listItem.animate}
      transition={ANIMATIONS.listItem.getTransition(index)}
    >
      <List.Item className="hover:bg-gray-50 transition-colors rounded p-4 mb-2">
        <List.Item.Meta
          title={
            <div className="flex justify-between items-start">
              <Space direction="vertical" size={4}>
                <Text className={`${STYLES.fonts.semibold} text-[${STYLES.colors.text}]`}>
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
                  <div className={`text-sm text-gray-700 ${STYLES.fonts.medium}`}>
                    {chat.category?.replace('_', ' ') || 'General'}
                  </div>
                </div>
                <div>
                  <Text className="text-xs text-gray-500 uppercase tracking-wide">Created</Text>
                  <div className={`text-sm text-gray-700 ${STYLES.fonts.medium}`}>
                    {formatDate(chat.createdAt)}
                  </div>
                </div>
                <div>
                  <Text className="text-xs text-gray-500 uppercase tracking-wide">Last Updated</Text>
                  <div className={`text-sm text-gray-700 ${STYLES.fonts.medium}`}>
                    {formatDate(chat.lastUpdated)}
                  </div>
                </div>
              </div>
              
              {lastMessage && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <Text className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
                    Last Message
                  </Text>
                  <Text className="text-sm text-gray-700">
                    {truncatedMessage}
                  </Text>
                </div>
              )}
              
              {chat.assignedTo && (
                <div className="mt-3">
                  <Text className="text-xs text-gray-500 uppercase tracking-wide">Assigned Agent</Text>
                  <div className={`text-sm text-gray-700 ${STYLES.fonts.medium}`}>
                    {chat.assignedTo.fullName}
                  </div>
                </div>
              )}
            </div>
          }
        />
      </List.Item>
    </motion.div>
  );
};

export default ChatTicketItem;