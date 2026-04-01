import { NotificationFiltersSchema } from "../../validators/notification/notification-schema";

export const NOTIFICATION_ICON_TYPES = {
  account_update: 'user',
  project_update: 'project',
  application_update: 'user',
  assessment_result: 'safety',
  system_alert: 'warning',
  system_announcement: 'info',
  security_alert: 'exclamation',
  payment_update: 'dollar',
  support_agent_joined: 'user',
  support_reply: 'info',
  support_chat: 'info',
  support_resolved: 'safety',
} as const;

export const PRIORITY_COLOR_MAP = {
  high: "#ff4d4f",
  medium: "#fa8c16",
  low: "#52c41a",
} as const;

export const NOTIFICATION_COLOR_MAP = {
  account_update: "#1890ff",
  project_update: "#722ed1",
  application_update: "#13c2c2",
  assessment_result: "#52c41a",
  system_alert: "#fa8c16",
  system_announcement: "#1890ff",
  security_alert: "#ff4d4f",
  payment_update: "#eb2f96",
  support_agent_joined: "#52c41a",
  support_reply: "#1890ff",
  support_chat: "#13c2c2",
  support_resolved: "#52c41a",
} as const;

export const DROPDOWN_STYLES = {
  container: { width: 380, maxHeight: 500, overflow: 'hidden' as const },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center'
  },
  content: { maxHeight: 400, overflowY: 'auto' as const },
  loadingContainer: { padding: '20px', textAlign: 'center' as const },
  emptyContainer: { padding: '20px' },
  footer: { padding: '8px 16px', textAlign: 'center' as const },
  overlay: {
    boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08)',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
  },
  badge: { backgroundColor: '#ff4d4f', fontSize: '10px' }
};

export const DEFAULT_FILTERS: NotificationFiltersSchema = {
  limit: 10,
  page: 1,
  unreadOnly: false
};