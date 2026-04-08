import {
  InfoCircleOutlined,
  UserOutlined,
  ProjectOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { NotificationType, Priority } from "../../types/notification.types";
import { NOTIFICATION_ICON_TYPES, PRIORITY_COLOR_MAP, NOTIFICATION_COLOR_MAP } from "./constants";
import { NotificationTypeSchema } from "../../validators/notification/notification-schema";

export const getNotificationIcon = (type: NotificationType) => {
  const iconType = NOTIFICATION_ICON_TYPES[type];
  
  switch (iconType) {
    case 'user':
      return <UserOutlined />;
    case 'project':
      return <ProjectOutlined />;
    case 'safety':
      return <SafetyCertificateOutlined />;
    case 'warning':
      return <WarningOutlined />;
    case 'info':
      return <InfoCircleOutlined />;
    case 'exclamation':
      return <ExclamationCircleOutlined />;
    case 'dollar':
      return <DollarOutlined />;
    default:
      return <InfoCircleOutlined />;
  }
};

export const getPriorityColor = (priority: Priority) => {
  return PRIORITY_COLOR_MAP[priority];
};

export const getNotificationColor = (type: NotificationTypeSchema) => {
  return NOTIFICATION_COLOR_MAP[type] || "#1890ff";
};