// ─── Shared ───────────────────────────────────────────────────────────────────

export interface HVNCOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export interface HVNCStats {
  totalDevices: number;
  onlineDevices: number;
  activeSessions: number;
  activeTimers: number;
}

export interface HVNCLiveDevice {
  id: string;
  name: string;
  status: "online" | "offline";
  uptime: string | null;
  user: string | null;
  lastSeen: string | null;
}

export interface HVNCActivityItem {
  id: string;
  type: "login" | "session" | "warning" | "completed" | "logout";
  subject: string;
  message: string;
  time: string;
  createdAt: string;
}

// ─── Device Management ────────────────────────────────────────────────────────

export interface HVNCDevice {
  id: number;
  pcName: string;
  status: "Active" | "Offline";
  assigned: string;
  assignedUserId: string;
  hubstaff: string;
  hubstaffSeconds: number;
  hubstaffPercent: number;
  lastSeen: string;
  lastSeenAt?: string;
  accessCode?: string;
  activity?: HVNCDeviceActivityItem[];
}

export interface HVNCDeviceActivityItem {
  label: string;
  time: string;
  active: boolean;
}

export interface HVNCDeviceListResponse {
  total: number;
  activeCount: number;
  inactiveCount: number;
  devices: HVNCDevice[];
}

export interface HVNCAccessCodeResponse {
  accessCode: string;
  generatedAt: string;
}

export interface HVNCHubstaffStartResponse {
  deviceId: number;
  hubstaffRunning: boolean;
  startedAt: string;
}

export interface HVNCHubstaffPauseResponse {
  deviceId: number;
  hubstaffRunning: boolean;
  pausedAt: string;
  elapsed: string;
}

// ─── Shift / Schedule Management ─────────────────────────────────────────────

export interface HVNCShift {
  id: string;
  userName: string;
  userEmail?: string;
  userId?: string;
  deviceName: string;
  deviceId: string;
  schedule?: string;
  status?: string;
  startDate?: string;
  endDate?: string | null;
  startTime: string;
  endTime: string;
  isRecurring?: boolean;
  daysOfWeek?: number[];
  timezone: string;
  isPrimary?: boolean;
}

export interface HVNCCalendarEvent {
  id: string;
  shiftId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  user: string;
  device: string;
  isRecurring: boolean;
  status: string;
}

export interface HVNCCalendarResponse {
  month: number;
  year: number;
  events: HVNCCalendarEvent[];
}

export interface HVNCShiftFormData {
  userId: string;
  deviceId: string;
  startDate?: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  daysOfWeek: number[];
  timezone: string;
}

export interface HVNCShiftUser {
  id: string;
  name: string;
}

export interface HVNCShiftDevice {
  id: string;
  name: string;
}

// ─── User Management ──────────────────────────────────────────────────────────

export interface HVNCUser {
  id: number | string;
  name?: string;
  userName?: string;
  email: string;
  role: string;
  deviceCount?: number;
  status: "Active" | "Inactive";
  lastActive?: string;
  lastActiveAt?: string;
  phone?: string;
  dateAdded?: string;
  stats?: HVNCUserStats;
  assignedDevices?: HVNCAssignedDevice[];
  usageTimeline?: HVNCUsageTimeline;
  // Backend field aliases
  activeShifts?: number;
  activeSessions?: number;
  lastLogin?: string;
  joinedDate?: string;
}

export interface HVNCUserStats {
  totalHours: string;
  thisWeek: string;
  today: string;
  avgDaily: string;
}

export interface HVNCAssignedDevice {
  id?: string;
  name: string;
  shift: string;
  lastUsed: string;
  lastUsedAt?: string;
}

export interface HVNCUsageTimeline {
  segments: { type: "active" | "idle" | "offline"; widthPercent: number }[];
}

export interface HVNCUserLog {
  id: string;
  deviceName: string;
  sessionStart: string;
  sessionEnd: string;
  duration: string;
  hubstaffTime: string;
  status: string;
}

// ─── DTUser (Enhanced User Management) ───────────────────────────────────────

export interface HVNCDTUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  metadata?: {
    department?: string;
    position?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HVNCDTUserListResponse {
  users: HVNCDTUser[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface HVNCDTUserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

// ─── Single User Device Assignment (new format) ───────────────────────────────

export interface HVNCAssignDevicePayload {
  deviceId: string;
  startTime: string;
  endTime: string;
  assignedDays: string[];
}

export interface HVNCAssignDeviceResponse {
  shiftId: string;
  userId: string;
  deviceId: string;
  startTime: string;
  endTime: string;
  assignedDays: string[];
  isActive: boolean;
  createdAt: string;
}

export interface HVNCTimeConflict {
  day: string;
  conflictStart: string;
  conflictEnd: string;
  existingUser: {
    name: string;
    email: string;
    timeSlot: string;
  };
}

// ─── Multi-User Device Assignment ─────────────────────────────────────────────

export interface HVNCUserAssignmentInput {
  userId: string;
  startTime: string;
  endTime: string;
  assignedDays: string[];
}

export interface HVNCAssignmentSuccess {
  userId: string;
  shiftId: string;
  message: string;
}

export interface HVNCAssignmentFailure {
  userId: string;
  error: string;
  conflicts?: HVNCTimeConflict[];
}

export interface HVNCBulkAssignmentResult {
  deviceId: string;
  successfulAssignments: HVNCAssignmentSuccess[];
  failedAssignments: HVNCAssignmentFailure[];
  totalSuccessful: number;
  totalFailed: number;
}

// ─── Device Users ─────────────────────────────────────────────────────────────

export interface HVNCShiftDetails {
  shiftId: string;
  startTime: string;
  endTime: string;
  assignedDays: string[];
  isActive: boolean;
}

export interface HVNCDeviceUserEntry {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  shiftDetails: HVNCShiftDetails;
}

export interface HVNCDeviceUsersResponse {
  deviceId: string;
  deviceName: string;
  assignedUsers: HVNCDeviceUserEntry[];
  totalAssignedUsers: number;
}

// ─── Device Schedule ──────────────────────────────────────────────────────────

export interface HVNCScheduleSlot {
  timeSlot: string;
  userId: string;
  userName: string;
  userEmail: string;
  shiftId: string;
  status: string;
}

export interface HVNCWeekInfo {
  startDate: string;
  endDate: string;
  weekNumber: number;
}

export interface HVNCUtilizationStats {
  totalHoursScheduled: number;
  totalHoursAvailable: number;
  utilizationPercentage: number;
  busyDays: string[];
  availableDays: string[];
  peakUsageDay: string;
  peakUsageHours: number;
}

export interface HVNCAvailableTimeSlot {
  day: string;
  availableSlots: string[];
}

export interface HVNCDeviceScheduleResponse {
  deviceId: string;
  deviceName: string;
  weekInfo: HVNCWeekInfo;
  schedule: Record<string, HVNCScheduleSlot[]>;
  utilizationStats: HVNCUtilizationStats;
  availableTimeSlots: HVNCAvailableTimeSlot[];
}

// ─── User Session History ─────────────────────────────────────────────────────

export interface HVNCUserSession {
  id: string;
  deviceId: string;
  deviceName: string;
  startTime: string;
  endTime?: string;
  duration?: string;
  status: string;
  createdAt: string;
}

// ─── User Session ─────────────────────────────────────────────────────────────

export interface HVNCValidateResponse {
  valid: boolean;
  deviceId?: string;
  deviceName?: string;
  sessionToken?: string;
  assignedUser?: string;
  shiftEnd?: string;
  shiftTimezone?: string;
  error?: string;
  message?: string;
  session?: {
    session_id: string;
    user?: { email: string; name: string; role: string };
    expires_at?: string;
  };
  shift?: {
    start_time?: string;
    end_time?: string;
    timezone?: string;
    remaining_minutes?: number;
  };
}

export interface HVNCSessionState {
  sessionId: string;
  deviceName: string;
  deviceId: string;
  status: "initializing" | "active" | "paused" | "terminated";
  hubstaffRunning: boolean;
  hubstaffSeconds: number;
  sessionSeconds: number;
  hubstaffTodayTotal: string;
  latencyMs: number;
  streamUrl: string;
  chromeSessionId: string;
  chromeSessionNumber: number;
  startedAt: string;
}

export interface HVNCTerminateResponse {
  success: boolean;
  sessionId: string;
  terminatedAt: string;
  totalDuration: string;
  hubstaffTotal: string;
}
