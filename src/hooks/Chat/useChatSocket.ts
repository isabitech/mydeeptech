import { useState, useEffect, useCallback } from 'react';
import ChatSocketService from '../../services/ChatSocketService';

interface UseChatSocketProps {
  token: string;
  userType: 'user' | 'admin';
  enabled?: boolean;
}

export const useChatSocket = ({ token, userType, enabled = true }: UseChatSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !token) return;

    // Connect to socket
    ChatSocketService.connect(token, userType);

    // Listen for connection events
    const handleConnection = (data: { connected: boolean }) => {
      setIsConnected(data.connected);
      setConnectionError(null);
    };

    const handleConnectionError = (data: { error: any }) => {
      setConnectionError(data.error?.message || 'Connection failed');
      setIsConnected(false);
    };

    ChatSocketService.on('connection_status', handleConnection);
    ChatSocketService.on('connection_error', handleConnectionError);

    // Cleanup on unmount
    return () => {
      ChatSocketService.off('connection_status', handleConnection);
      ChatSocketService.off('connection_error', handleConnectionError);
      ChatSocketService.disconnect();
    };
  }, [token, userType, enabled]);

  const reconnect = useCallback(() => {
    if (token) {
      ChatSocketService.disconnect();
      setTimeout(() => {
        ChatSocketService.connect(token, userType);
      }, 1000);
    }
  }, [token, userType]);

  const disconnect = useCallback(() => {
    ChatSocketService.disconnect();
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    connectionError,
    reconnect,
    disconnect,
    socket: ChatSocketService.getSocket()
  };
};