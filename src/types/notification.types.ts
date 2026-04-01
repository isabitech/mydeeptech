export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: Priority;
  isRead: boolean;
  actionUrl?: string | null;
  actionText?: string | null;
  data?: {
    actionUrl?: string | null;
    actionText?: string | null;
    [key: string]: any;
  };
  createdAt: string;
  readAt?: string | null;
  recipientId?: string;
  recipientType?: 'user' | 'all';
  scheduleFor?: string | null;
}

export interface NotificationSummary {
  totalNotifications: number;
  unreadCount: number;
  readCount: number;
  recentCount: number;
  priorityBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  typeBreakdown: {
    account_update: number;
    project_update: number;
    system_alert: number;
    assessment_result: number;
    [key: string]: number;
  };
  lastNotificationTime?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalNotifications: number; // Changed from totalCount to match backend response
  hasNextPage: boolean; // Changed from hasNext to match backend
  hasPrevPage: boolean; // Changed from hasPrev to match backend
  limit: number; // Added limit field from backend response
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
    pagination: PaginationInfo;
    summary: NotificationSummary;
  };
}

export interface NotificationSummaryResponse {
  success: boolean;
  message: string;
  data: NotificationSummary;
}

export interface CreateNotificationForm {
  recipientId?: string;
  recipientType: 'user' | 'all';
  title: string;
  message: string;
  type: NotificationType;
  priority: Priority;
  actionUrl?: string;
  actionText?: string;
  relatedData?: any;
  scheduleFor?: string;
  data?: any;
}

export interface BroadcastNotificationForm {
  title: string;
  message: string;
  type: NotificationType;
  priority: Priority;
  targetAudience: 'all' | 'annotators' | 'micro_taskers' | 'verified_users';
  actionUrl?: string;
  actionText?: string;
  scheduleFor?: string;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
  priority?: Priority;
  recipientType?: string;
  recipientId?: string;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface HookOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

export type NotificationType = 
  | 'account_update'
  | 'project_update' 
  | 'application_update'
  | 'assessment_result'
  | 'system_alert'
  | 'system_announcement'
  | 'security_alert'
  | 'payment_update'
  | 'support_agent_joined'
  | 'support_reply'
  | 'support_chat'
  | 'support_resolved';

export type Priority = 'low' | 'medium' | 'high';