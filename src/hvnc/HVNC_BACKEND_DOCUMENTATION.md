# HVNC Platform — Backend Integration Documentation

**Version:** 1.0
**Frontend Stack:** React + TypeScript + Tailwind CSS
**Prepared for:** Backend Development Team

---

## Overview

The HVNC (Hidden Virtual Network Computing) platform is a remote desktop access system embedded in the company dashboard. It serves two roles:

- **Admin**: Manages devices, users, schedules, and monitors all sessions from a control panel.
- **User**: Enters an access code to connect to an assigned remote PC and work inside a hidden Chrome session.

This document describes every API endpoint, WebSocket event, data model, and integration point needed to make the frontend fully functional with a real backend.

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Module: Admin Dashboard](#2-module-admin-dashboard)
3. [Module: Admin Device Management](#3-module-admin-device-management)
4. [Module: Admin Shift Scheduling](#4-module-admin-shift-scheduling)
5. [Module: Admin User Management](#5-module-admin-user-management)
6. [Module: User Portal (Access Code Entry)](#6-module-user-portal-access-code-entry)
7. [Module: User Connecting (Session Initialization)](#7-module-user-connecting-session-initialization)
8. [Module: User Session (Active Remote Desktop)](#8-module-user-session-active-remote-desktop)
9. [WebSocket Events Reference](#9-websocket-events-reference)
10. [Data Models Reference](#10-data-models-reference)
11. [Error Codes Reference](#11-error-codes-reference)

---

## 1. Authentication & Authorization

All HVNC API routes are protected. Every request must carry a valid JWT in the Authorization header.

```
Authorization: Bearer <jwt_token>
```

### Roles

| Role    | Access Scope                                      |
|---------|---------------------------------------------------|
| `admin` | Full access to all admin HVNC endpoints           |
| `user`  | Access code validation, session start/terminate   |

### Token Claims (expected by frontend)

```json
{
  "sub": "user_id",
  "role": "admin | user",
  "email": "user@example.com",
  "name": "Full Name",
  "assignedDevice": "WORK-PC-01",
  "shiftEnd": "17:00",
  "shiftTimezone": "EST"
}
```

> The `assignedDevice` and `shiftEnd` fields populate the info bar shown in the User Portal:
> `"Assigned PC: WORK-PC-01 | Shift ends at 5:00 PM EST"`

---

## 2. Module: Admin Dashboard

**Frontend File:** `src/pages/Dashboard/Admin/hvncmgt/AdminHVNCDashboard.tsx`

This is the first view in the HVNC admin panel. It displays summary stats, a live device grid, and a recent activity feed.

---

### 2.1 GET `/api/hvnc/admin/stats`

Fetch the 4 summary stat cards shown at the top of the dashboard.

**Auth:** Admin only

**Response:**
```json
{
  "totalDevices": 12,
  "onlineDevices": 8,
  "activeSessions": 5,
  "activeTimers": 3
}
```

**Frontend Usage:** Each number maps to a stat card:
- `totalDevices` → "Total Devices"
- `onlineDevices` → "Online"
- `activeSessions` → "Active Sessions"
- `activeTimers` → "Timers"

---

### 2.2 GET `/api/hvnc/admin/devices/live`

Fetch the list of devices shown in the "Live Devices" grid on the dashboard.

**Auth:** Admin only

**Response:**
```json
{
  "devices": [
    {
      "id": "1",
      "name": "WORK-PC-01",
      "user": "Admin",
      "status": "online",
      "uptime": "04:20:11",
      "lastSeen": null
    },
    {
      "id": "3",
      "name": "WORK-PC-03",
      "user": null,
      "status": "offline",
      "uptime": null,
      "lastSeen": "2h ago"
    }
  ]
}
```

**Field Notes:**
- `status`: `"online"` | `"offline"`
- `uptime`: formatted as `"HH:MM:SS"` — only present when `status === "online"`
- `user`: the assigned user's display name — `null` if no one is assigned
- `lastSeen`: human-readable string — only present when `status === "offline"`

---

### 2.3 GET `/api/hvnc/admin/activity`

Fetch the recent activity feed shown on the right side of the dashboard.

**Auth:** Admin only

**Query Params:**
- `limit` (optional, default: 10) — number of items to return

**Response:**
```json
{
  "items": [
    {
      "id": "1",
      "type": "login",
      "subject": "WORK-PC-01",
      "message": "logged in",
      "time": "2 minutes ago",
      "createdAt": "2026-03-12T14:32:00Z"
    },
    {
      "id": "3",
      "type": "warning",
      "subject": "SYSTEM",
      "message": "connection spike",
      "time": "34 minutes ago",
      "createdAt": "2026-03-12T14:00:00Z"
    }
  ]
}
```

**`type` values and their icon mapping (handled by frontend):**

| `type`      | Icon shown         | Color     |
|-------------|--------------------|-----------|
| `login`     | LoginOutlined      | emerald   |
| `session`   | SyncOutlined       | orange    |
| `warning`   | WarningOutlined    | amber     |
| `completed` | CheckCircleOutlined| purple    |
| `logout`    | LogoutOutlined     | red       |

---

### 2.4 WebSocket: Real-Time Dashboard Updates

Connect to the admin dashboard WebSocket to receive live stat and device status updates without polling.

**Endpoint:** `ws://<host>/ws/hvnc/admin/dashboard`

See [Section 9](#9-websocket-events-reference) for the full event list.

---

## 3. Module: Admin Device Management

**Frontend File:** `src/pages/Dashboard/Admin/hvncmgt/AdminHVNCDevices.tsx`

This view provides a table of all HVNC devices with filtering, a detail panel for the selected device, Hubstaff time tracking controls, and access code management.

---

### 3.1 GET `/api/hvnc/admin/devices`

Fetch all registered devices.

**Auth:** Admin only

**Query Params:**
- `status` (optional): `"Active"` | `"Offline"` — filter by status

**Response:**
```json
{
  "total": 24,
  "activeCount": 18,
  "inactiveCount": 6,
  "devices": [
    {
      "id": 1,
      "pcName": "WORK-PC-01",
      "status": "Active",
      "assigned": "John Doe",
      "assignedUserId": "usr_001",
      "hubstaff": "07:42:15",
      "hubstaffSeconds": 27735,
      "hubstaffPercent": 85,
      "lastSeen": "2 mins ago",
      "lastSeenAt": "2026-03-12T14:30:00Z"
    }
  ]
}
```

**Field Notes:**
- `hubstaff`: formatted string for display (`"HH:MM:SS"`)
- `hubstaffSeconds`: raw integer — useful if frontend needs to run a live timer
- `hubstaffPercent`: `0–100` — drives the progress bar in the device table
- `status`: `"Active"` | `"Offline"` — case-sensitive, matches frontend types exactly

---

### 3.2 GET `/api/hvnc/admin/devices/:deviceId`

Fetch full detail for a single device (used when admin selects a row).

**Auth:** Admin only

**Response:**
```json
{
  "id": 1,
  "pcName": "WORK-PC-01",
  "status": "Active",
  "assigned": "John Doe",
  "assignedUserId": "usr_001",
  "hubstaff": "07:42:15",
  "hubstaffSeconds": 27735,
  "hubstaffPercent": 85,
  "lastSeen": "2 mins ago",
  "accessCode": "XK7M9P2R",
  "activity": [
    {
      "label": "Session Started",
      "time": "Today at 08:30 AM",
      "active": true
    },
    {
      "label": "Files Uploaded (3)",
      "time": "Today at 10:15 AM",
      "active": false
    },
    {
      "label": "IP Check - Success",
      "time": "Yesterday at 04:45 PM",
      "active": false
    }
  ]
}
```

**Field Notes:**
- `accessCode`: the current 8-character alphanumeric code for this device
- `activity`: timeline events shown in the detail panel; `active: true` marks the most recent/current event with the orange dot

---

### 3.3 POST `/api/hvnc/admin/devices`

Register a new device.

**Auth:** Admin only

**Request Body:**
```json
{
  "pcName": "NEW-PC-09",
  "assignedUserId": "usr_005"
}
```

**Response:**
```json
{
  "id": 9,
  "pcName": "NEW-PC-09",
  "status": "Offline",
  "assigned": "Alex Chen",
  "assignedUserId": "usr_005",
  "hubstaff": "00:00:00",
  "hubstaffSeconds": 0,
  "hubstaffPercent": 0,
  "lastSeen": "Never",
  "accessCode": "AB3X7Y9Z"
}
```

---

### 3.4 PUT `/api/hvnc/admin/devices/:deviceId`

Update device assignment or other editable fields.

**Auth:** Admin only

**Request Body (partial):**
```json
{
  "assignedUserId": "usr_003",
  "pcName": "WORK-PC-01-RENAMED"
}
```

**Response:** Updated device object (same shape as GET `/devices/:deviceId`)

---

### 3.5 DELETE `/api/hvnc/admin/devices/:deviceId`

Remove a device from the system.

**Auth:** Admin only

**Response:**
```json
{ "success": true, "message": "Device removed successfully." }
```

---

### 3.6 POST `/api/hvnc/admin/devices/:deviceId/access-code/generate`

Generate a new access code for a device and invalidate the old one.

**Auth:** Admin only

**Response:**
```json
{
  "accessCode": "PQ4R8STV",
  "generatedAt": "2026-03-12T15:00:00Z"
}
```

> **Important:** The old access code must be immediately invalidated. Any user trying to connect with the old code must receive a `401` error.

---

### 3.7 POST `/api/hvnc/admin/devices/:deviceId/hubstaff/start`

Start the Hubstaff timer for a device.

**Auth:** Admin only

**Response:**
```json
{
  "deviceId": 1,
  "hubstaffRunning": true,
  "startedAt": "2026-03-12T15:01:00Z"
}
```

---

### 3.8 POST `/api/hvnc/admin/devices/:deviceId/hubstaff/pause`

Pause the Hubstaff timer for a device.

**Auth:** Admin only

**Response:**
```json
{
  "deviceId": 1,
  "hubstaffRunning": false,
  "pausedAt": "2026-03-12T15:05:00Z",
  "elapsed": "00:04:00"
}
```

---

## 4. Module: Admin Shift Scheduling

**Frontend File:** `src/pages/Dashboard/Admin/hvncmgt/AdminHVNCSchedules.tsx`

This view provides a weekly calendar grid showing scheduled shifts and a form to create new shifts.

---

### 4.1 GET `/api/hvnc/admin/schedules/week`

Fetch the shift schedule for a given week.

**Auth:** Admin only

**Query Params:**
- `weekStart` (required): ISO date string for the Monday of the target week, e.g. `"2026-03-02"`

**Response:**
```json
{
  "weekStart": "2026-03-02",
  "weekEnd": "2026-03-08",
  "days": [
    {
      "label": "Mon",
      "date": "02",
      "fullDate": "2026-03-02",
      "isToday": false,
      "isWeekend": false,
      "shifts": [
        {
          "id": "shf_001",
          "time": "09:00 - 17:00",
          "startTime": "09:00",
          "endTime": "17:00",
          "person": "John Doe",
          "userId": "usr_001",
          "device": "PC-ALPHA-01",
          "deviceId": "dev_001",
          "isPrimary": true,
          "timezone": "(GMT-05:00) Eastern Time",
          "recurringDays": [true, true, true, true, true, false, false]
        }
      ]
    }
  ]
}
```

**Field Notes:**
- `isPrimary`: `true` = orange left border, full opacity. `false` = gray left border, 80% opacity
- `isToday`: highlights the column with a subtle white background ring
- `isWeekend`: renders an "Off-Peak / No Shifts Scheduled" placeholder instead of shift cards
- `recurringDays`: boolean array `[Mon, Tue, Wed, Thu, Fri, Sat, Sun]`

---

### 4.2 POST `/api/hvnc/admin/schedules`

Create a new shift.

**Auth:** Admin only

**Request Body:**
```json
{
  "userId": "usr_001",
  "deviceId": "dev_001",
  "startTime": "09:00",
  "endTime": "17:00",
  "timezone": "(GMT-05:00) Eastern Time",
  "recurringDays": [true, true, true, true, true, false, false],
  "weekStart": "2026-03-02"
}
```

**Validation Rules:**
- `userId` and `deviceId` are required — return `400` if missing
- `startTime` must be before `endTime` (unless overnight shift, e.g. `17:00 - 01:00`)
- A device cannot have two overlapping shifts on the same day

**Response:**
```json
{
  "id": "shf_010",
  "userId": "usr_001",
  "person": "John Doe",
  "deviceId": "dev_001",
  "device": "PC-ALPHA-01",
  "startTime": "09:00",
  "endTime": "17:00",
  "timezone": "(GMT-05:00) Eastern Time",
  "recurringDays": [true, true, true, true, true, false, false],
  "isPrimary": true,
  "createdAt": "2026-03-12T15:10:00Z"
}
```

---

### 4.3 DELETE `/api/hvnc/admin/schedules/:shiftId`

Delete a shift.

**Auth:** Admin only

**Response:**
```json
{ "success": true }
```

---

### 4.4 GET `/api/hvnc/admin/schedules/export`

Export the schedule as a CSV file.

**Auth:** Admin only

**Query Params:**
- `weekStart` (required): ISO date string, e.g. `"2026-03-02"`

**Response:** `Content-Type: text/csv` with file download headers.

---

### 4.5 GET `/api/hvnc/admin/schedules/users`

List users available for shift assignment (populates the "Select User" dropdown in the form).

**Auth:** Admin only

**Response:**
```json
{
  "users": [
    { "id": "usr_001", "name": "John Doe" },
    { "id": "usr_002", "name": "Sarah Miller" }
  ]
}
```

---

### 4.6 GET `/api/hvnc/admin/schedules/devices`

List devices available for shift assignment (populates the "Assign Device" dropdown in the form).

**Auth:** Admin only

**Response:**
```json
{
  "devices": [
    { "id": "dev_001", "name": "PC-ALPHA-01" },
    { "id": "dev_002", "name": "PC-BETA-04" }
  ]
}
```

---

## 5. Module: Admin User Management

**Frontend File:** `src/pages/Dashboard/Admin/hvncmgt/AdminHVNCUsers.tsx`

This view lists all HVNC users in a table, and shows a detail panel with profile info, usage stats, assigned devices, and a 24-hour activity timeline.

---

### 5.1 GET `/api/hvnc/admin/users`

Fetch all HVNC users.

**Auth:** Admin only

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@hvnc.io",
      "role": "Senior Systems Admin",
      "deviceCount": 1,
      "status": "Active",
      "lastActive": "2 mins ago",
      "lastActiveAt": "2026-03-12T14:30:00Z"
    }
  ]
}
```

---

### 5.2 GET `/api/hvnc/admin/users/:userId`

Fetch full detail for a user (loads the detail panel when a user row is selected).

**Auth:** Admin only

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@hvnc.io",
  "role": "Senior Systems Admin",
  "phone": "+1 (555) 0123-4567",
  "dateAdded": "Jan 15, 2023",
  "status": "Active",
  "deviceCount": 1,
  "lastActive": "2 mins ago",
  "stats": {
    "totalHours": "127h",
    "thisWeek": "24h",
    "today": "5h 15m",
    "avgDaily": "4.2h"
  },
  "assignedDevices": [
    {
      "id": "dev_001",
      "name": "WORK-PC-01",
      "shift": "9AM - 5PM",
      "lastUsed": "Today, 10:24 AM",
      "lastUsedAt": "2026-03-12T10:24:00Z"
    }
  ],
  "usageTimeline": {
    "segments": [
      { "type": "active",  "widthPercent": 40 },
      { "type": "idle",    "widthPercent": 10 },
      { "type": "active",  "widthPercent": 20 },
      { "type": "offline", "widthPercent": 30 }
    ]
  }
}
```

**`usageTimeline` Notes:**
- Each segment's `widthPercent` represents its share of the 24-hour window
- All `widthPercent` values must sum to 100
- Segment `type` values:
  - `"active"` → orange (`#F6921E`)
  - `"idle"` → dark gray (`#334155`)
  - `"offline"` → dark gray (`#334155`)

---

### 5.3 POST `/api/hvnc/admin/users`

Create a new HVNC user.

**Auth:** Admin only

**Request Body:**
```json
{
  "name": "New User",
  "email": "new@hvnc.io",
  "role": "Operations Analyst",
  "phone": "+1 (555) 0000-0000"
}
```

**Response:** Created user object (same shape as GET `/users/:userId`)

---

### 5.4 POST `/api/hvnc/admin/users/:userId/devices`

Assign a device to a user.

**Auth:** Admin only

**Request Body:**
```json
{
  "deviceId": "dev_003",
  "shift": "9AM - 5PM"
}
```

**Response:**
```json
{
  "success": true,
  "assignedDevice": {
    "id": "dev_003",
    "name": "OFFICE-LAPTOP",
    "shift": "9AM - 5PM",
    "lastUsed": "Never"
  }
}
```

---

### 5.5 DELETE `/api/hvnc/admin/users/:userId/devices/:deviceId`

Unassign a device from a user.

**Auth:** Admin only

**Response:**
```json
{ "success": true, "message": "Device unassigned successfully." }
```

> **Cascading Effect:** When a device is unassigned, invalidate any active access codes that belong to this user/device pair. The user's running session (if any) should be terminated gracefully.

---

### 5.6 GET `/api/hvnc/admin/users/:userId/logs`

Fetch the session logs for a user (triggered by "View Logs" button per device row).

**Auth:** Admin only

**Query Params:**
- `deviceId` (optional): filter logs to a specific device

**Response:**
```json
{
  "logs": [
    {
      "id": "log_001",
      "deviceName": "WORK-PC-01",
      "sessionStart": "2026-03-12T08:30:00Z",
      "sessionEnd": "2026-03-12T17:00:00Z",
      "duration": "8h 30m",
      "hubstaffTime": "7h 42m",
      "status": "completed"
    }
  ]
}
```

---

## 6. Module: User Portal (Access Code Entry)

**Frontend File:** `src/pages/Dashboard/User/hvnc/UserHVNCPortal.tsx`

The user lands here first. They enter an 8-character access code split across two 4-character inputs. On submit, the frontend validates the format (exactly 8 alphanumeric chars) then calls the backend.

---

### 6.1 POST `/api/hvnc/session/validate`

Validate the access code entered by the user.

**Auth:** User (JWT required)

**Request Body:**
```json
{
  "accessCode": "XK7M9P2R"
}
```

**Success Response `200`:**
```json
{
  "valid": true,
  "deviceId": "dev_001",
  "deviceName": "WORK-PC-01",
  "sessionToken": "eyJ...",
  "assignedUser": "John Doe",
  "shiftEnd": "17:00",
  "shiftTimezone": "EST"
}
```

**Field Notes:**
- `sessionToken`: a short-lived token (recommended: 15-minute expiry) used exclusively for the subsequent session initialization calls. This prevents the main JWT from being exposed in session-level requests.
- After a successful response, the frontend transitions from `stage: 'portal'` → `stage: 'connecting'`

**Error Response `401`:**
```json
{
  "valid": false,
  "error": "INVALID_CODE",
  "message": "Invalid access code. Please check and try again."
}
```

**Error Response `403` (code valid but wrong user):**
```json
{
  "valid": false,
  "error": "UNAUTHORIZED_USER",
  "message": "This access code is not assigned to your account."
}
```

**Error Response `409` (device already in session):**
```json
{
  "valid": false,
  "error": "DEVICE_BUSY",
  "message": "This device is currently in use by another session."
}
```

---

## 7. Module: User Connecting (Session Initialization)

**Frontend File:** `src/pages/Dashboard/User/hvnc/UserHVNCConnecting.tsx`

After code validation, the frontend shows a 3-step animated connecting screen. Each step must map to a real backend operation. The frontend steps are:

| Step | Label                                  | Duration (UI) |
|------|----------------------------------------|---------------|
| 1    | Validating access code...              | 2000ms        |
| 2    | Starting hidden Chrome session...      | 3000ms        |
| 3    | Initializing remote desktop stream... | 2500ms        |

**Integration Approach:**
The frontend currently uses fixed timeouts. For real backend integration, replace the fixed timers with API polling or a WebSocket handshake. The recommended approach is a **session initialization WebSocket**.

---

### 7.1 WebSocket: Session Initialization

**Endpoint:** `ws://<host>/ws/hvnc/session/init`

**On Connect:** Send the session token from step 6.1:
```json
{ "sessionToken": "eyJ..." }
```

**Server → Client Events (in order):**

**Step 1 complete:**
```json
{
  "event": "step_complete",
  "step": 1,
  "label": "Validating access code...",
  "status": "done"
}
```

**Step 2 complete:**
```json
{
  "event": "step_complete",
  "step": 2,
  "label": "Starting hidden Chrome session...",
  "status": "done",
  "chromeSessionId": "chr_session_001"
}
```

**Step 3 complete / Ready:**
```json
{
  "event": "session_ready",
  "step": 3,
  "status": "done",
  "streamUrl": "wss://<stream-host>/session/chr_session_001",
  "sessionId": "sess_abc123",
  "hubstaffSeconds": 8148,
  "sessionSeconds": 6312
}
```

> On `session_ready`, the frontend transitions from `stage: 'connecting'` → `stage: 'session'`.
> `streamUrl` is where the remote desktop stream will be delivered.
> `hubstaffSeconds` and `sessionSeconds` are the initial timer values (the frontend counts up from these).

**Error event:**
```json
{
  "event": "error",
  "code": "CONTAINER_FAILED",
  "message": "Failed to start Chrome container. Please try again."
}
```

> On error, the frontend shows a failure state and allows the user to go back to the portal.

---

### 7.2 POST `/api/hvnc/session/cancel`

Called when the user clicks "Cancel Connection" during the connecting phase.

**Auth:** User (JWT required)

**Request Body:**
```json
{
  "sessionToken": "eyJ..."
}
```

**Response:**
```json
{ "success": true, "message": "Session initialization cancelled." }
```

> This must clean up any partially-started containers or reserved resources.

---

## 8. Module: User Session (Active Remote Desktop)

**Frontend File:** `src/pages/Dashboard/User/hvnc/UserHVNCSession.tsx`

This is the active session view. It embeds a remote desktop stream (currently mocked as a Gmail UI) with a sidebar, browser controls, and a bottom taskbar showing live timers.

---

### 8.1 Remote Desktop Stream

The main workspace area will render a live stream of the remote PC. Implement using one of these approaches:

**Option A: WebRTC** (recommended for low latency)
- Frontend receives an SDP offer via WebSocket (`streamUrl` from `session_ready` event)
- Standard WebRTC peer connection setup in the session component
- Render the video stream in an `<video>` element replacing the Gmail mockup div

**Option B: WebSocket MJPEG frames**
- Server sends compressed JPEG frames over the `streamUrl` WebSocket
- Frontend decodes and renders to a `<canvas>` element

**Option C: noVNC / VNC-over-WebSocket**
- Use a noVNC client embedded in an iframe or React wrapper
- Point it at the VNC WebSocket proxy URL

> The frontend component has a placeholder content area (the Gmail mockup) that will be replaced by the actual stream renderer once the stream integration is implemented.

---

### 8.2 GET `/api/hvnc/session/:sessionId`

Fetch the current session state (called on session mount to get initial values).

**Auth:** User (JWT required, must own this session)

**Response:**
```json
{
  "sessionId": "sess_abc123",
  "deviceName": "WORK-PC-01",
  "deviceId": "dev_001",
  "status": "active",
  "hubstaffRunning": true,
  "hubstaffSeconds": 8148,
  "sessionSeconds": 6312,
  "hubstaffTodayTotal": "6h 30m",
  "latencyMs": 24,
  "streamUrl": "wss://<stream-host>/session/chr_session_001",
  "chromeSessionId": "chr_session_001",
  "chromeSessionNumber": 1
}
```

**Frontend Usage:**
- `hubstaffSeconds`: seed value for the Hubstaff live timer (counts up from this)
- `sessionSeconds`: seed value for the Session Duration live timer (counts up from this)
- `hubstaffTodayTotal`: static display string "Today's total: 6h 30m"
- `latencyMs`: shown as `"24ms"` in the taskbar
- `chromeSessionNumber`: shown as `"Chrome Session #001"` overlay badge

---

### 8.3 WebSocket: Session Heartbeat & Events

**Endpoint:** `ws://<host>/ws/hvnc/session/:sessionId/events`

**Purpose:** Keep the session alive, receive latency updates, and handle force-disconnect events.

**Client → Server (heartbeat, send every 30 seconds):**
```json
{ "event": "ping", "timestamp": 1741788720000 }
```

**Server → Client:**

Latency update:
```json
{ "event": "latency_update", "latencyMs": 18 }
```

Session force-terminated by admin:
```json
{
  "event": "session_terminated",
  "reason": "ADMIN_TERMINATED",
  "message": "Your session was ended by an administrator."
}
```

Shift ending warning (5 minutes before shift end):
```json
{
  "event": "shift_warning",
  "message": "Your shift ends in 5 minutes.",
  "shiftEndsAt": "17:00 EST"
}
```

> On `session_terminated`, the frontend calls `onDisconnect()`, returning the user to the portal stage.

---

### 8.4 POST `/api/hvnc/session/:sessionId/hubstaff/pause`

Pause the Hubstaff timer from the user session view (pause button in taskbar).

**Auth:** User (must own this session)

**Response:**
```json
{
  "hubstaffRunning": false,
  "pausedAt": "2026-03-12T15:05:00Z",
  "elapsedSeconds": 8148
}
```

---

### 8.5 POST `/api/hvnc/session/:sessionId/hubstaff/resume`

Resume the Hubstaff timer.

**Auth:** User (must own this session)

**Response:**
```json
{
  "hubstaffRunning": true,
  "resumedAt": "2026-03-12T15:07:00Z"
}
```

---

### 8.6 POST `/api/hvnc/session/:sessionId/terminate`

Terminate the active session (triggered by "Terminate Session" button in taskbar).

**Auth:** User (must own this session)

**Request Body:**
```json
{
  "sessionId": "sess_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "sess_abc123",
  "terminatedAt": "2026-03-12T17:00:00Z",
  "totalDuration": "1h 45m 12s",
  "hubstaffTotal": "2h 15m 48s"
}
```

**Cascading Actions the Backend Must Perform:**
1. Stop and record the Hubstaff timer
2. Kill the hidden Chrome container
3. Free the device (set status back to available)
4. Write a session log entry
5. Invalidate the session token
6. Notify any admin WebSocket listeners that the device is now offline

---

## 9. WebSocket Events Reference

### Admin Dashboard WebSocket
**Endpoint:** `ws://<host>/ws/hvnc/admin/dashboard`

| Event               | Payload                                              | Description                          |
|---------------------|------------------------------------------------------|--------------------------------------|
| `stats_update`      | `{ totalDevices, onlineDevices, activeSessions, activeTimers }` | Refresh stat cards      |
| `device_status`     | `{ deviceId, name, status, uptime, user }`           | Single device status change          |
| `activity_item`     | `{ id, type, subject, message, time }`               | New activity feed item               |

### Session Initialization WebSocket
**Endpoint:** `ws://<host>/ws/hvnc/session/init`

| Event            | Payload                                                      | Description               |
|------------------|--------------------------------------------------------------|---------------------------|
| `step_complete`  | `{ step, label, status: "done" }`                            | A step finished           |
| `session_ready`  | `{ step, status, streamUrl, sessionId, hubstaffSeconds, sessionSeconds }` | All steps done |
| `error`          | `{ code, message }`                                          | Initialization failed     |

### Active Session WebSocket
**Endpoint:** `ws://<host>/ws/hvnc/session/:sessionId/events`

| Event                | Payload                                        | Direction       |
|----------------------|------------------------------------------------|-----------------|
| `ping`               | `{ timestamp }`                                | Client → Server |
| `pong`               | `{ timestamp }`                                | Server → Client |
| `latency_update`     | `{ latencyMs }`                                | Server → Client |
| `session_terminated` | `{ reason, message }`                          | Server → Client |
| `shift_warning`      | `{ message, shiftEndsAt }`                     | Server → Client |
| `hubstaff_sync`      | `{ hubstaffSeconds, hubstaffRunning }`          | Server → Client |

---

## 10. Data Models Reference

### Device
```typescript
interface Device {
  id: number;
  pcName: string;
  status: 'Active' | 'Offline';
  assigned: string;               // User display name
  assignedUserId: string;
  hubstaff: string;               // "HH:MM:SS"
  hubstaffSeconds: number;        // Raw integer for live counting
  hubstaffPercent: number;        // 0-100
  lastSeen: string;               // Human-readable relative time
  lastSeenAt: string;             // ISO 8601 timestamp
  accessCode?: string;            // 8-char alphanumeric
  activity?: ActivityItem[];
}
```

### Shift
```typescript
interface Shift {
  id: string;
  time: string;                   // "09:00 - 17:00" formatted string
  startTime: string;              // "09:00"
  endTime: string;                // "17:00"
  person: string;                 // User display name
  userId: string;
  device: string;                 // Device display name
  deviceId: string;
  isPrimary: boolean;
  timezone: string;
  recurringDays: boolean[];       // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
}
```

### UserRecord
```typescript
interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  dateAdded: string;              // "Jan 15, 2023"
  deviceCount: number;
  status: 'Active' | 'Inactive';
  lastActive: string;             // Human-readable relative time
  stats: {
    totalHours: string;           // "127h"
    thisWeek: string;             // "24h"
    today: string;                // "5h 15m"
    avgDaily: string;             // "4.2h"
  };
  assignedDevices: AssignedDevice[];
  usageTimeline: {
    segments: { type: 'active' | 'idle' | 'offline'; widthPercent: number }[];
  };
}
```

### Session
```typescript
interface Session {
  sessionId: string;
  deviceId: string;
  deviceName: string;
  userId: string;
  status: 'initializing' | 'active' | 'paused' | 'terminated';
  hubstaffRunning: boolean;
  hubstaffSeconds: number;
  sessionSeconds: number;
  hubstaffTodayTotal: string;
  latencyMs: number;
  streamUrl: string;
  chromeSessionId: string;
  chromeSessionNumber: number;
  startedAt: string;
  terminatedAt?: string;
}
```

---

## 11. Error Codes Reference

| HTTP Status | Error Code             | Meaning                                           |
|-------------|------------------------|---------------------------------------------------|
| 400         | `VALIDATION_ERROR`     | Missing or malformed request fields               |
| 400         | `INVALID_TIME_RANGE`   | Shift end time before start time                  |
| 401         | `INVALID_CODE`         | Access code not found or expired                  |
| 401         | `UNAUTHORIZED`         | JWT missing, expired, or invalid                  |
| 403         | `UNAUTHORIZED_USER`    | Code valid but does not belong to this user       |
| 403         | `FORBIDDEN`            | User lacks permission for this action             |
| 404         | `DEVICE_NOT_FOUND`     | Device ID does not exist                          |
| 404         | `USER_NOT_FOUND`       | User ID does not exist                            |
| 404         | `SESSION_NOT_FOUND`    | Session ID does not exist or already terminated   |
| 409         | `DEVICE_BUSY`          | Device is already in an active session            |
| 409         | `SCHEDULE_CONFLICT`    | Shift overlaps with an existing shift             |
| 500         | `CONTAINER_FAILED`     | Chrome container failed to start                  |
| 500         | `STREAM_FAILED`        | Remote desktop stream could not be established    |

---

## Frontend Integration Checklist

Use this checklist to track integration progress module by module.

### Admin Dashboard
- [ ] Replace static stat numbers with `GET /api/hvnc/admin/stats`
- [ ] Replace static device cards with `GET /api/hvnc/admin/devices/live`
- [ ] Replace static activity feed with `GET /api/hvnc/admin/activity`
- [ ] Connect admin dashboard WebSocket for real-time updates

### Admin Device Management
- [ ] Replace static device list with `GET /api/hvnc/admin/devices`
- [ ] Load device detail panel with `GET /api/hvnc/admin/devices/:deviceId`
- [ ] Wire "Register Device" button to `POST /api/hvnc/admin/devices`
- [ ] Wire Edit/Delete buttons to `PUT` / `DELETE` endpoints
- [ ] Wire "Generate New" (access code) to `POST .../access-code/generate`
- [ ] Wire "Start" / "Pause" Hubstaff buttons to `POST .../hubstaff/start|pause`

### Admin Shift Scheduling
- [ ] Load weekly calendar with `GET /api/hvnc/admin/schedules/week`
- [ ] Populate "Select User" dropdown from `GET /api/hvnc/admin/schedules/users`
- [ ] Populate "Assign Device" dropdown from `GET /api/hvnc/admin/schedules/devices`
- [ ] Wire "Schedule Shift" form to `POST /api/hvnc/admin/schedules`
- [ ] Wire "Export CSV" button to `GET /api/hvnc/admin/schedules/export`

### Admin User Management
- [ ] Replace static user table with `GET /api/hvnc/admin/users`
- [ ] Load user detail panel with `GET /api/hvnc/admin/users/:userId`
- [ ] Wire "Add User" button to `POST /api/hvnc/admin/users`
- [ ] Wire "Assign New Device" to `POST /api/hvnc/admin/users/:userId/devices`
- [ ] Wire "Unassign" button to `DELETE .../devices/:deviceId`
- [ ] Wire "View Logs" button to `GET /api/hvnc/admin/users/:userId/logs`
- [ ] Replace static usage timeline bars with `usageTimeline.segments` from user detail response

### User Portal
- [ ] Wire "Start Session" button to `POST /api/hvnc/session/validate`
- [ ] Display assigned PC and shift end time from JWT claims in info bar
- [ ] Show error banner on `401` / `403` / `409` responses

### User Connecting
- [ ] Replace fixed timeouts with session init WebSocket (`ws://.../session/init`)
- [ ] Map `step_complete` events to step status updates
- [ ] Transition to session stage on `session_ready` event
- [ ] Wire "Cancel Connection" button to `POST /api/hvnc/session/cancel`

### User Session
- [ ] Fetch initial session state from `GET /api/hvnc/session/:sessionId`
- [ ] Seed `hubstaffSecs` and `sessionSecs` timers from API values
- [ ] Connect active session WebSocket (`ws://.../session/:sessionId/events`)
- [ ] Handle `latency_update`, `session_terminated`, `shift_warning` events
- [ ] Replace Gmail mockup with real remote desktop stream renderer (WebRTC / noVNC)
- [ ] Wire "Pause" button (Hubstaff) to `POST .../hubstaff/pause`
- [ ] Wire "Terminate Session" button to `POST .../terminate`
