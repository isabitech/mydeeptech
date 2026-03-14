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
