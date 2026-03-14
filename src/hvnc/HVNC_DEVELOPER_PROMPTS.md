# HVNC Developer Integration Prompts

---

## PROMPT 1 — Frontend Developer

**Context:** The HVNC platform has been fully implemented on the backend as a module inside the existing MyDeepTech application. It is NOT a standalone system. The existing DTUser JWT token (the same one used across the entire MyDeepTech app) is what authenticates both admins and workers on all HVNC routes. There is no separate HVNC login.

---

### Authentication

All HVNC API calls must include the standard DTUser JWT token in the Authorization header:

```
Authorization: Bearer <dtuser_jwt_token>
```

- **Admin routes** (`/api/hvnc/admin/*`) — accessible to users whose `role === 'admin'` or whose email ends in `@mydeeptech.ng`
- **User/worker routes** (`/api/hvnc/user/*`) — accessible to any verified DTUser
- **Device routes** (`/api/hvnc/devices/*`) — these are for the Windows PC agent only, NOT the browser

---

### Worker (Remote Worker) Flow

This is what a logged-in worker sees and does in the frontend.

**Step 1 — Request an access code**

The worker clicks "Request Access Code" in the HVNC section. This sends their email to the backend and they receive a 6-digit code by email.

```
POST /api/hvnc/codes/request
Body: { "email": "worker@example.com" }
Response: { "success": true, "message": "Access code sent to your email" }
```

- No auth token required for this endpoint
- The code is valid for **15 minutes**
- The backend checks that the user has an active shift assigned for the current time before generating the code

**Step 2 — Enter the code to start a session**

The worker enters the 6-digit code from their email. The frontend sends it along with the worker's email and the device ID they are assigned to.

```
POST /api/hvnc/codes/validate
Body: {
  "email": "worker@example.com",
  "code": "482931",
  "device_id": "DEVICE-ABC123"   // the device assigned to this worker
}
Response: {
  "success": true,
  "session": {
    "session_id": "sess_xxxxx",
    "device_id": "DEVICE-ABC123",
    "status": "active",
    "started_at": "2026-03-12T10:00:00Z"
  }
}
```

- No auth token required for this endpoint
- On success, the backend automatically creates the session AND dispatches a `start_session` command to the physical Windows PC via WebSocket
- The physical PC will launch Chrome/Hubstaff automatically — the worker does not need to do anything else
- Store the returned `session_id` in frontend state for session tracking

**Step 3 — Worker Dashboard**

After session starts, load the worker's dashboard:

```
GET /api/hvnc/user/dashboard
Headers: Authorization: Bearer <dtuser_jwt>
Response: {
  "success": true,
  "data": {
    "active_session": { ... },
    "assigned_devices": [ ... ],
    "recent_sessions": [ ... ],
    "shift_status": { "is_active": true, "shift_name": "Morning" }
  }
}
```

**Other worker endpoints:**

```
GET /api/hvnc/user/devices          // worker's assigned devices
GET /api/hvnc/user/sessions         // session history
GET /api/hvnc/user/profile          // worker profile
POST /api/hvnc/user/sessions/:sessionId/end   // end active session
```

---

### Admin Flow

Admins use their existing DTUser JWT. No separate login needed.

**Dashboard & Monitoring**

```
GET /api/hvnc/admin/stats           // total devices, active sessions, users, uptime
GET /api/hvnc/admin/devices/live    // real-time status of all connected devices
GET /api/hvnc/admin/activity        // recent activity feed
GET /api/hvnc/admin/activity-logs   // full paginated activity logs
```

**Device Management**

```
GET    /api/hvnc/admin/devices              // list all registered devices
GET    /api/hvnc/admin/devices/:deviceId    // device detail + session history
POST   /api/hvnc/admin/devices              // register a new PC
PUT    /api/hvnc/admin/devices/:deviceId    // update device (assign user, rename, etc.)
DELETE /api/hvnc/admin/devices/:deviceId    // remove a device
POST   /api/hvnc/admin/devices/:deviceId/access-code/generate   // generate new device JWT token
POST   /api/hvnc/admin/devices/:deviceId/hubstaff/start         // start Hubstaff timer remotely
POST   /api/hvnc/admin/devices/:deviceId/hubstaff/pause         // pause Hubstaff timer remotely
```

Register device body:
```json
{
  "pc_name": "Office-PC-01",
  "device_id": "DEVICE-ABC123",
  "assigned_user_email": "worker@example.com",
  "location": "Lagos Office"
}
```

**Shift Scheduling**

```
GET    /api/hvnc/admin/shifts               // list all shifts
GET    /api/hvnc/admin/shifts/:shiftId      // shift details
POST   /api/hvnc/admin/shifts               // create shift
PUT    /api/hvnc/admin/shifts/:shiftId      // update shift
DELETE /api/hvnc/admin/shifts/:shiftId      // delete shift
GET    /api/hvnc/admin/shifts/calendar      // calendar view
GET    /api/hvnc/admin/shifts/users         // users available for shift assignment
GET    /api/hvnc/admin/shifts/devices       // devices available for shift assignment
```

Create shift body:
```json
{
  "shift_name": "Morning Shift",
  "user_email": "worker@example.com",
  "device_id": "DEVICE-ABC123",
  "start_time": "08:00",
  "end_time": "16:00",
  "timezone": "Africa/Lagos",
  "days_of_week": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "start_date": "2026-03-01",
  "end_date": null
}
```

**User Management**

```
GET    /api/hvnc/admin/users                // list all HVNC users
GET    /api/hvnc/admin/users/:userId        // user detail
POST   /api/hvnc/admin/users               // create HVNC worker account
PUT    /api/hvnc/admin/users/:userId        // update user
DELETE /api/hvnc/admin/users/:userId        // delete user
POST   /api/hvnc/admin/users/:userId/reset-password   // reset password
POST   /api/hvnc/admin/users/:userId/unlock           // unlock locked account
```

**Access Code Management**

```
GET  /api/hvnc/codes/list                  // list all codes (with status)
POST /api/hvnc/codes/generate              // manually generate a code for a user
POST /api/hvnc/codes/:code_id/revoke       // revoke a code
```

**Session Management**

```
GET  /api/hvnc/sessions/stats              // real-time session statistics
GET  /api/hvnc/sessions/active             // all currently active sessions
GET  /api/hvnc/sessions/:session_id        // specific session details
POST /api/hvnc/sessions/:sessionId/force-end  // force-terminate a session
POST /api/hvnc/sessions/cleanup            // clean up timed-out sessions
```

**Send Command to Device (Admin)**

```
POST /api/hvnc/admin/commands/send
Body: {
  "device_id": "DEVICE-ABC123",
  "type": "chrome",            // "session" | "chrome" | "hubstaff" | "system"
  "action": "open_tab",
  "parameters": { "url": "https://example.com" },
  "session_id": "sess_xxxxx",  // optional
  "priority": "normal"         // "low" | "normal" | "high"
}
```

---

### Real-time WebSocket (Admin Dashboard)

Connect to the admin Socket.IO namespace using the DTUser JWT:

```javascript
import { io } from 'socket.io-client';

const socket = io('/hvnc/socket.io/admin', {
  auth: { token: dtUserJwt }
});

// Listen for real-time events
socket.on('device_status_changed', (data) => { /* update device list */ });
socket.on('session_started', (data) => { /* new session alert */ });
socket.on('session_ended', (data) => { /* session ended alert */ });
socket.on('device_connected', (data) => { /* device came online */ });
socket.on('device_disconnected', (data) => { /* device went offline */ });
```

---

### Error Codes

| Code | Meaning |
|------|---------|
| `TOKEN_MISSING` | No JWT in Authorization header |
| `TOKEN_EXPIRED` | JWT expired — redirect to login |
| `INVALID_TOKEN` | Malformed JWT |
| `USER_NOT_FOUND` | User deleted from system |
| `EMAIL_NOT_VERIFIED` | User hasn't verified email |
| `ADMIN_ACCESS_DENIED` | User is not admin |
| `INVALID_CODE` | Access code wrong or expired |
| `CODE_EXPIRED` | Code TTL (15 min) exceeded |
| `OUTSIDE_SHIFT` | Request made outside assigned shift window |
| `DEVICE_NOT_FOUND` | device_id doesn't match any registered device |
| `RATE_LIMIT_EXCEEDED` | Too many requests — show retry timer |

---

---

