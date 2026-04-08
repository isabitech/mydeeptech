import React from "react";
import { Button, Divider } from "antd";
import { DROPDOWN_STYLES } from "./constants";
import { NotificationSchema } from "../../validators/notification/notification-schema";

interface NotificationFooterProps {
  notifications: NotificationSchema[] | undefined;
  isAdmin?: boolean;
  onViewAll: () => void;
}

export const NotificationFooter: React.FC<NotificationFooterProps> = ({ 
  notifications, 
  onViewAll 
}) => {

  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <>
      <Divider style={{ margin: 0 }} />
      <div style={DROPDOWN_STYLES.footer}>
        <Button 
          type="link" 
          size="small"
          onClick={onViewAll}
        >
          View all notifications
        </Button>
      </div>
    </>
  );
};