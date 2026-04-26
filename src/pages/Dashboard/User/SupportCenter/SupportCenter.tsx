import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { chatQueryService } from '../../../../services/chat-service';
import { ChatTicket } from '../../../../types/chat.types';
import { ANIMATIONS, STYLES } from './utilities/constants';
import SupportHeader from './components/SupportHeader';
import QuickActions from './components/QuickActions';
import ChatHistoryCard from './components/ChatHistoryCard';

const SupportCenter: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  const { 
    data: chatHistoryResponse,
    isLoading: loading,
    isError,
    error,
    refetch
  } = chatQueryService.useChatHistory({ page: currentPage, limit: pageSize });

  // Extract data from response
  const chatHistory: ChatTicket[] = chatHistoryResponse?.data?.chats || [];
  const totalChats = chatHistoryResponse?.data?.pagination?.totalChats || 0;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 ${STYLES.fonts.regular}`}>
      <motion.div
        initial={ANIMATIONS.container.initial}
        animate={ANIMATIONS.container.animate}
        transition={ANIMATIONS.container.transition}
        className="max-w-6xl mx-auto"
      >
        <SupportHeader />
        <QuickActions />
        <ChatHistoryCard
          chatHistory={chatHistory}
          totalChats={totalChats}
          currentPage={currentPage}
          pageSize={pageSize}
          loading={loading}
          isError={isError}
          error={error}
          onPageChange={setCurrentPage}
          onRefresh={refetch}
        />
      </motion.div>
    </div>
  );
};

export default SupportCenter;