
import { z } from "zod";

/* =========================
   ENUMS
========================= */

const NotificationTypeSchema = z.enum([
  "account_update",
  "project_update",
  "application_update",
  "assessment_result",
  "system_alert",
  "system_announcement",
  "security_alert",
  "payment_update",
]);

const PrioritySchema = z.enum(["low", "medium", "high"]);


/* =========================
   CORE MODELS
========================= */

const NotificationSchema = z.object({
  _id: z.string(),
  userId: z.string().optional(),
  userModel: z.string().optional(),
  title: z.string(),
  message: z.string(),
  type: NotificationTypeSchema,
  priority: PrioritySchema,
  isRead: z.boolean(),
  actionUrl: z.string().nullable().optional(),
  actionText: z.string().nullable().optional(),
  data: z.object({
    actionUrl: z.string().nullable().optional(),
    actionText: z.string().nullable().optional(),
  })
  .catchall(z.any())
  .optional(),

  createdAt: z.string(), // optionally: .datetime()
  readAt: z.string().nullable().optional(),

  recipientId: z.string().optional(),
  recipientType: z.enum(["user", "all"]).optional(),

  scheduleFor: z.string().nullable().optional(),
  __v: z.number().optional(), // MongoDB version field
});


/* =========================
   SUMMARY
========================= */

const NotificationSummarySchema = z.object({
  totalNotifications: z.number(),
  unreadCount: z.number(),
  readCount: z.number(),

  recentCount: z.number().optional(),

  priorityBreakdown: z
    .object({
      high: z.number(),
      medium: z.number(),
      low: z.number(),
    })
    .optional(),

  typeBreakdown: z
    .object({})
    .catchall(z.number())
    .optional(),

  lastNotificationTime: z.string().optional(),
});


/* =========================
   PAGINATION
========================= */

const PaginationInfoSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  totalNotifications: z.number(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
  limit: z.number(),
});


/* =========================
   RESPONSES
========================= */

const NotificationsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    notifications: z.array(NotificationSchema),
    pagination: PaginationInfoSchema,
    summary: NotificationSummarySchema,
  }),
});

const NotificationSummaryResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: NotificationSummarySchema,
});


/* =========================
   FORMS
========================= */

const CreateNotificationFormSchema = z.object({
  recipientId: z.string().optional(),
  recipientType: z.enum(["user", "all"]),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: NotificationTypeSchema,
  priority: PrioritySchema,
  actionUrl: z.string().optional(),
  actionText: z.string().optional(),
  relatedData: z.any().optional(),
  scheduleFor: z.string().optional(),
  data: z.any().optional(),
});

const BroadcastNotificationFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: NotificationTypeSchema,
  priority: PrioritySchema,
  targetAudience: z.enum([
    "all",
    "annotators",
    "micro_taskers",
    "verified_users",
  ]),
  actionUrl: z.string().optional(),
  actionText: z.string().optional(),
  scheduleFor: z.string().optional(),
});


/* =========================
   FILTERS
========================= */

const NotificationFiltersSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  unreadOnly: z.boolean().optional(),
  type: NotificationTypeSchema.optional(),
  priority: PrioritySchema.optional(),
  recipientType: z.string().optional(),
  recipientId: z.string().optional(),
  isRead: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});


/* =========================
   GENERIC RESULT
========================= */

const HookOperationResultSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
});


/* =========================
   TYPES
========================= */

type NotificationSchema = z.infer<typeof NotificationSchema>;
type NotificationSummarySchema = z.infer<typeof NotificationSummarySchema>;
type PaginationInfoSchema = z.infer<typeof PaginationInfoSchema>;
type NotificationsResponseSchema = z.infer<typeof NotificationsResponseSchema>;
type NotificationSummaryResponseSchema = z.infer<typeof NotificationSummaryResponseSchema>;
type CreateNotificationFormSchema = z.infer<typeof CreateNotificationFormSchema>;
type BroadcastNotificationFormSchema = z.infer<typeof BroadcastNotificationFormSchema>;
type NotificationFiltersSchema = z.infer<typeof NotificationFiltersSchema>;
type HookOperationResultSchema = z.infer<typeof HookOperationResultSchema>;
type NotificationTypeSchema = z.infer<typeof NotificationTypeSchema>;
type PrioritySchema = z.infer<typeof PrioritySchema>;


/* =========================
   EXPORTS
========================= */

export {
  NotificationSchema,
  NotificationSummarySchema,
  PaginationInfoSchema,
  NotificationsResponseSchema,
  NotificationSummaryResponseSchema,
  CreateNotificationFormSchema,
  BroadcastNotificationFormSchema,
  NotificationFiltersSchema,
  HookOperationResultSchema,
  NotificationTypeSchema,
  PrioritySchema,
};
