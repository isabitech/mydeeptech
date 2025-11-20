export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: Priority;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  relatedData?: any;
  createdAt: string;
  readAt?: string;
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
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
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
  | 'payment_update';

export type Priority = 'low' | 'medium' | 'high';