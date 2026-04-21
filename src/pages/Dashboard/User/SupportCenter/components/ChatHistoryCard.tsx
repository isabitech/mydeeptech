import React from 'react';
import { Card, Button, List } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { toast } from 'sonner';
import { ChatTicket } from '../../../../../types/chat.types';
import { STYLES } from '../utilities/constants';
import { LoadingState, ErrorState, EmptyState } from './LoadingStates';
import ChatTicketItem from './ChatTicketItem';

interface ChatHistoryCardProps {
  chatHistory: ChatTicket[];
  totalChats: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  isError: boolean;
  error: any;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

const ChatHistoryCard: React.FC<ChatHistoryCardProps> = ({
  chatHistory,
  totalChats,
  currentPage,
  pageSize,
  loading,
  isError,
  error,
  onPageChange,
  onRefresh
}) => {
  const handleRefresh = () => {
    onRefresh();
    toast.success('Refreshing chat history...');
  };

  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (isError) return <ErrorState error={error} onRetry={onRefresh} />;
    if (chatHistory.length === 0) return <EmptyState />;

    return (
      <List
        dataSource={chatHistory}
        pagination={{
          current: currentPage,
          total: totalChats,
          pageSize: pageSize,
          onChange: onPageChange,
          showSizeChanger: false
        }}
        renderItem={(chat, index) => (
          <ChatTicketItem key={chat._id || chat.ticketNumber} chat={chat} index={index} />
        )}
      />
    );
  };

  return (
    <Card 
      title={
        <div className="flex justify-between items-center">
          <span className={`${STYLES.fonts.semibold} text-[${STYLES.colors.text}]`}>
            Your Support History
          </span>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      }
      className="shadow-lg"
    >
      {renderContent()}
    </Card>
  );
};

export default ChatHistoryCard;