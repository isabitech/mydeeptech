import React from "react";
import { Button, Typography } from "antd";
import { DROPDOWN_STYLES } from "./constants";

const { Text } = Typography;

interface NotificationHeaderProps {
  summary: any;
  onMarkAllAsRead: (event: React.MouseEvent) => void;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({ 
  summary, 
  onMarkAllAsRead 
}) => (
  <div style={DROPDOWN_STYLES.header}>
    <Text strong>Notifications</Text>
    {summary && summary.unreadCount > 0 && (
      <Button
        type="link"
        size="small"
        onClick={onMarkAllAsRead}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ padding: 0 }}
      >
        Mark all as read
      </Button>
    )}
  </div>
);