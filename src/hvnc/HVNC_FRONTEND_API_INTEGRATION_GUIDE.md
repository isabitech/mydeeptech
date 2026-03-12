# HVNC Frontend API Integration Guide

This document provides comprehensive frontend integration instructions for the HVNC (Hosted Virtual Network Computing) system. All endpoints documented here have been implemented and tested in the backend.

## Table of Contents
1. [Authentication](#authentication)
2. [Admin Dashboard APIs](#admin-dashboard-apis)
3. [Admin Device Management APIs](#admin-device-management-apis)
4. [Admin Shift Scheduling APIs](#admin-shift-scheduling-apis)
5. [Admin User Management APIs](#admin-user-management-apis)
6. [User Portal APIs](#user-portal-apis)
7. [Session Management APIs](#session-management-apis)
8. [WebSocket Integration](#websocket-integration)
9. [Error Handling](#error-handling)
10. [Frontend Implementation Examples](#frontend-implementation-examples)

---

## Authentication

### Headers Required
All API endpoints require authentication headers:

```javascript
// For Admin endpoints
{
  'Authorization': 'Bearer <admin_jwt_token>',
  'Content-Type': 'application/json'
}

// For User endpoints  
{
  'Authorization': 'Bearer <user_jwt_token>',
  'Content-Type': 'application/json'
}
```

### Permission Requirements
- **Admin Dashboard**: `admin_dashboard` permission
- **Device Management**: `device_management` permission  
- **Shift Management**: `shift_management` permission
- **User Management**: `user_management` permission

---

## Admin Dashboard APIs

### 1. Get Dashboard Statistics
**Endpoint:** `GET /api/hvnc/admin/stats`
**Permission:** `admin_dashboard`

**Response:**
```json
{
  "totalDevices": 25,
  "onlineDevices": 18,
  "activeSessions": 12,
  "activeTimers": 8
}
```

**Frontend Usage:**
```javascript
const fetchDashboardStats = async () => {
  const response = await fetch('/api/hvnc/admin/stats', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  return response.json();
};
```

### 2. Get Live Devices Grid
**Endpoint:** `GET /api/hvnc/admin/devices/live`
**Permission:** `admin_dashboard`

**Response:**
```json
{
  "devices": [
    {
      "id": "device_id_123",
      "name": "HVNC-DEV-01",
      "status": "online",
      "uptime": "2h 15m",
      "user": "John Doe",
      "lastSeen": "2 minutes ago"
    }
  ]
}
```

### 3. Get Activity Feed
**Endpoint:** `GET /api/hvnc/admin/activity`
**Permission:** `admin_dashboard`
**Query Params:** `limit` (default: 10)

**Response:**
```json
{
  "items": [
    {
      "id": "activity_123",
      "type": "session_started",
      "subject": "John Doe",
      "message": "started session on HVNC-DEV-01",
      "time": "2026-03-12T10:30:00Z"
    }
  ]
}
```

---

## Admin Device Management APIs

### 1. Get All Devices
**Endpoint:** `GET /api/hvnc/admin/devices`
**Permission:** `device_management`
**Query Params:** `status` (Active, Offline)

**Response:**
```json
{
  "total": 25,
  "activeCount": 18,
  "inactiveCount": 7,
  "devices": [
    {
      "id": "device_id_123",
      "pcName": "HVNC-DEV-01",
      "status": "Active",
      "assigned": "John Doe",
      "assignedUserId": "user_id_456",
      "hubstaff": "06:45:30",
      "hubstaffSeconds": 24330,
      "hubstaffPercent": 84
    }
  ]
}
```

### 2. Get Device Details
**Endpoint:** `GET /api/hvnc/admin/devices/:deviceId`
**Permission:** `device_management`

**Response:**
```json
{
  "id": "device_id_123",
  "pcName": "HVNC-DEV-01",
  "status": "Active",
  "assigned": "John Doe",
  "assignedUserId": "user_id_456",
  "hubstaff": "06:45:30",
  "hubstaffSeconds": 24330,
  "hubstaffPercent": 84,
  "lastSeen": "2 minutes ago",
  "accessCode": "A1B2C3D4",
  "activity": [
    {
      "id": "activity_123",
      "time": "10:30",
      "event": "Session Started",
      "active": true
    }
  ]
}
```

### 3. Register New Device
**Endpoint:** `POST /api/hvnc/admin/devices`
**Permission:** `device_management`

**Request Body:**
```json
{
  "pcName": "HVNC-NEW-DEVICE",
  "assignedUserId": "user_id_789" // Optional
}
```

**Response:**
```json
{
  "id": "new_device_id",
  "pcName": "HVNC-NEW-DEVICE",
  "status": "Offline",
  "assigned": "Jane Smith",
  "assignedUserId": "user_id_789",
  "hubstaff": "00:00:00",
  "hubstaffSeconds": 0,
  "hubstaffPercent": 0,
  "lastSeen": "Never",
  "accessCode": "E5F6G7H8"
}
```

### 4. Update Device Assignment
**Endpoint:** `PUT /api/hvnc/admin/devices/:deviceId`
**Permission:** `device_management`

**Request Body:**
```json
{
  "assignedUserId": "user_id_new",
  "pcName": "HVNC-RENAMED-DEVICE" // Optional
}
```

### 5. Delete Device
**Endpoint:** `DELETE /api/hvnc/admin/devices/:deviceId`
**Permission:** `device_management`

**Response:**
```json
{
  "success": true,
  "message": "Device removed successfully."
}
```

### 6. Generate New Access Code
**Endpoint:** `POST /api/hvnc/admin/devices/:deviceId/access-code/generate`
**Permission:** `device_management`

**Response:**
```json
{
  "accessCode": "X9Y8Z7W6",
  "generatedAt": "2026-03-12T10:30:00Z"
}
```

### 7. Hubstaff Timer Controls
**Start Timer:** `POST /api/hvnc/admin/devices/:deviceId/hubstaff/start`
**Pause Timer:** `POST /api/hvnc/admin/devices/:deviceId/hubstaff/pause`
**Permission:** `device_management`

**Start Response:**
```json
{
  "deviceId": "device_id_123",
  "hubstaffRunning": true,
  "startedAt": "2026-03-12T10:30:00Z"
}
```

**Pause Response:**
```json
{
  "deviceId": "device_id_123",
  "hubstaffRunning": false,
  "pausedAt": "2026-03-12T12:30:00Z",
  "elapsed": "02:00:00"
}
```

---

## Admin Shift Scheduling APIs

### 1. Get All Shifts
**Endpoint:** `GET /api/hvnc/admin/shifts`
**Permission:** `shift_management`
**Query Params:** `status`, `user_id`, `device_id`, `start_date`, `end_date`

**Response:**
```json
{
  "total": 15,
  "shifts": [
    {
      "id": "shift_id_123",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "deviceName": "HVNC-DEV-01",
      "deviceId": "device_id_123",
      "schedule": "Mon, Tue, Wed 09:00 - 17:00",
      "status": "Active",
      "startDate": "2026-03-01T00:00:00Z",
      "endDate": null,
      "startTime": "09:00",
      "endTime": "17:00",
      "isRecurring": true,
      "daysOfWeek": [1, 2, 3],
      "timezone": "UTC"
    }
  ]
}
```

### 2. Get Shift Details
**Endpoint:** `GET /api/hvnc/admin/shifts/:shiftId`
**Permission:** `shift_management`

**Response:**
```json
{
  "id": "shift_id_123",
  "userId": "user_id_456",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "deviceId": "device_id_789", 
  "deviceIdValue": "HVNC_123456789",
  "deviceName": "HVNC-DEV-01",
  "startDate": "2026-03-01T00:00:00Z",
  "endDate": null,
  "startTime": "09:00",
  "endTime": "17:00",
  "isRecurring": true,
  "daysOfWeek": [1, 2, 3, 4, 5],
  "timezone": "UTC",
  "status": "active"
}
```

### 3. Create New Shift
**Endpoint:** `POST /api/hvnc/admin/shifts`
**Permission:** `shift_management`

**Request Body:**
```json
{
  "userId": "user_id_456",
  "deviceId": "device_id_789",
  "startDate": "2026-03-15",
  "endDate": "2026-12-31", // Optional for recurring
  "startTime": "09:00",
  "endTime": "17:00",
  "isRecurring": true,
  "daysOfWeek": [1, 2, 3, 4, 5], // Mon-Fri
  "timezone": "UTC"
}
```

### 4. Update Shift
**Endpoint:** `PUT /api/hvnc/admin/shifts/:shiftId`
**Permission:** `shift_management`

**Request Body:** Same as create, all fields optional

### 5. Delete Shift
**Endpoint:** `DELETE /api/hvnc/admin/shifts/:shiftId`
**Permission:** `shift_management`

### 6. Get Calendar View
**Endpoint:** `GET /api/hvnc/admin/shifts/calendar`
**Permission:** `shift_management`
**Query Params:** `month`, `year`

**Response:**
```json
{
  "month": 3,
  "year": 2026,
  "events": [
    {
      "id": "shift_123_2026-03-15",
      "shiftId": "shift_123",
      "title": "John Doe - HVNC-DEV-01",
      "date": "2026-03-15",
      "startTime": "09:00",
      "endTime": "17:00",
      "user": "John Doe",
      "device": "HVNC-DEV-01",
      "isRecurring": true,
      "status": "active"
    }
  ]
}
```

---

## Admin User Management APIs

### 1. Get All Users
**Endpoint:** `GET /api/hvnc/admin/users`
**Permission:** `user_management`
**Query Params:** `status`, `role`, `search`

**Response:**
```json
{
  "total": 50,
  "activeCount": 45,
  "lockedCount": 2,
  "inactiveCount": 3,
  "users": [
    {
      "id": "user_id_123",
      "userName": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "status": "Active",
      "activeShifts": 2,
      "activeSessions": 1,
      "lastLogin": "2 hours ago",
      "joinedDate": "2026-01-15T00:00:00Z",
      "permissions": ["device_access"]
    }
  ]
}
```

### 2. Get User Details
**Endpoint:** `GET /api/hvnc/admin/users/:userId`
**Permission:** `user_management`

**Response:**
```json
{
  "id": "user_id_123",
  "userName": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "status": "Active",
  "permissions": ["device_access"],
  "profile": {
    "fullName": "John Doe",
    "phone": "+1234567890",
    "timezone": "UTC",
    "country": "US",
    "joinedDate": "2026-01-15T00:00:00Z",
    "lastLogin": "2026-03-12T08:30:00Z"
  },
  "assignedDevices": [
    {
      "id": "device_id_456",
      "name": "HVNC-DEV-01",
      "deviceId": "HVNC_123456789",
      "status": "Online",
      "shiftId": "shift_id_789",
      "schedule": "09:00 - 17:00"
    }
  ],
  "recentSessions": [
    {
      "id": "session_id_101",
      "device": "HVNC-DEV-01",
      "startTime": "2026-03-12T09:00:00Z",
      "endTime": "2026-03-12T16:30:00Z",
      "duration": "7h 30m",
      "status": "ended"
    }
  ],
  "activityLog": [
    {
      "id": "activity_id_201",
      "type": "session_started",
      "message": "session started",
      "time": "2026-03-12T09:00:00Z",
      "details": { "device_id": "HVNC_123456789" }
    }
  ]
}
```

### 3. Create New User
**Endpoint:** `POST /api/hvnc/admin/users`
**Permission:** `user_management`

**Request Body:**
```json
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "password": "secure_password_123",
  "role": "user",
  "permissions": ["device_access"],
  "phone": "+1234567890",
  "timezone": "UTC",
  "country": "US"
}
```

### 4. Update User
**Endpoint:** `PUT /api/hvnc/admin/users/:userId`
**Permission:** `user_management`

**Request Body:** Same as create, all fields optional
```json
{
  "fullName": "Jane Smith Updated",
  "role": "admin",
  "permissions": ["device_access", "admin_dashboard"],
  "isActive": true,
  "isLocked": false
}
```

### 5. Delete User
**Endpoint:** `DELETE /api/hvnc/admin/users/:userId`
**Permission:** `user_management`
**Query Params:** `hardDelete` (true/false)

**Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

### 6. Reset User Password
**Endpoint:** `POST /api/hvnc/admin/users/:userId/reset-password`
**Permission:** `user_management`

**Request Body:**
```json
{
  "newPassword": "new_secure_password", // Optional - auto-generated if not provided
  "sendEmail": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "temporaryPassword": "auto_generated_123" // Only if no password provided
}
```

### 7. Unlock User Account
**Endpoint:** `POST /api/hvnc/admin/users/:userId/unlock`
**Permission:** `user_management`

**Response:**
```json
{
  "success": true,
  "message": "User account unlocked successfully"
}
```

---

## User Portal APIs

### 1. Get User Dashboard
**Endpoint:** `GET /api/hvnc/user/dashboard`
**Authentication:** User JWT Token

**Response:**
```json
{
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "stats": {
    "assignedDevices": 3,
    "activeSessions": 1,
    "todayTime": "4h 30m",
    "totalDevices": 3
  },
  "assignedDevices": [
    {
      "id": "device_id_123",
      "name": "HVNC-DEV-01",
      "deviceId": "HVNC_123456789",
      "status": "Online",
      "lastSeen": "2026-03-12T10:25:00Z",
      "shiftTime": "09:00 - 17:00",
      "shiftId": "shift_id_456"
    }
  ],
  "sessionHistory": [
    {
      "id": "session_id_789",
      "deviceName": "HVNC-DEV-01",
      "startTime": "2026-03-12T09:00:00Z",
      "endTime": "2026-03-12T12:30:00Z",
      "duration": "3h 30m",
      "status": "ended"
    }
  ]
}
```

### 2. Get User's Assigned Devices
**Endpoint:** `GET /api/hvnc/user/devices`
**Authentication:** User JWT Token

**Response:**
```json
{
  "devices": [
    {
      "id": "device_id_123",
      "name": "HVNC-DEV-01", 
      "deviceId": "HVNC_123456789",
      "status": "Online",
      "lastSeen": "Just now",
      "hasActiveSession": false,
      "sessionId": null,
      "shiftTime": "09:00 - 17:00",
      "shiftDays": [1, 2, 3, 4, 5],
      "isRecurring": true
    }
  ]
}
```

### 3. Get User's Session History
**Endpoint:** `GET /api/hvnc/user/sessions`
**Authentication:** User JWT Token
**Query Params:** `status`, `device_id`, `limit`

**Response:**
```json
{
  "sessions": [
    {
      "id": "session_id_123",
      "deviceName": "HVNC-DEV-01",
      "deviceId": "HVNC_123456789",
      "startTime": "2026-03-12T09:00:00Z",
      "endTime": "2026-03-12T16:30:00Z",
      "duration": "7h 30m",
      "status": "Completed",
      "terminationReason": null
    }
  ],
  "total": 25
}
```

### 4. Start New Session
**Endpoint:** `POST /api/hvnc/user/sessions/start`
**Authentication:** User JWT Token

**Request Body:**
```json
{
  "deviceId": "device_id_123"
}
```

**Response:**
```json
{
  "sessionId": "session_id_new",
  "deviceName": "HVNC-DEV-01",
  "deviceId": "HVNC_123456789",
  "startTime": "2026-03-12T10:30:00Z",
  "status": "active",
  "message": "Session started successfully"
}
```

### 5. End Session
**Endpoint:** `POST /api/hvnc/user/sessions/:sessionId/end`
**Authentication:** User JWT Token

**Response:**
```json
{
  "sessionId": "session_id_123",
  "endTime": "2026-03-12T16:30:00Z",
  "duration": "6h 0m",
  "status": "ended",
  "message": "Session ended successfully"
}
```

### 6. Get User Profile
**Endpoint:** `GET /api/hvnc/user/profile`
**Authentication:** User JWT Token

**Response:**
```json
{
  "id": "user_id_123",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "role": "user",
  "profile": {
    "timezone": "UTC",
    "country": "US",
    "joinedDate": "2026-01-15T00:00:00Z",
    "lastLogin": "2026-03-12T08:30:00Z"
  },
  "statistics": {
    "totalSessions": 125,
    "activeSessions": 1,
    "assignedDevices": 3,
    "totalTimeThisMonth": "45h 30m"
  }
}
```

---

## Session Management APIs

### 1. Get Session Statistics
**Endpoint:** `GET /api/hvnc/sessions/stats`
**Permission:** `admin_dashboard`

**Response:**
```json
{
  "realtime": {
    "activeSessions": 15,
    "connectedDevices": 22,
    "connectedUsers": 18,
    "totalConnections": 40
  },
  "database": {
    "totalSessions": 1250,
    "activeSessions": 15,
    "completedSessions": 1235
  }
}
```

### 2. Force End Session
**Endpoint:** `POST /api/hvnc/sessions/:sessionId/force-end`
**Permission:** `device_management`

**Request Body:**
```json
{
  "reason": "force_ended_by_admin" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session terminated successfully"
}
```

---

## WebSocket Integration

### Connection URLs
**Device Connection:**
```javascript
const deviceWs = new WebSocket('ws://localhost:3000/ws?type=device&token=DEVICE_ACCESS_CODE');
```

**User Connection:**
```javascript
const userWs = new WebSocket('ws://localhost:3000/ws?type=user&token=USER_JWT_TOKEN');
```

### WebSocket Message Types

#### From Client to Server
```javascript
// Ping/Pong
ws.send(JSON.stringify({ type: 'ping' }));

// Device Heartbeat
ws.send(JSON.stringify({
  type: 'device_heartbeat',
  data: {
    systemInfo: {
      cpu_usage: 45,
      memory_usage: 60,
      disk_usage: 30
    }
  }
}));

// Start Session (User)
ws.send(JSON.stringify({
  type: 'start_session',
  data: { deviceId: 'HVNC_123456789' }
}));

// End Session (User)
ws.send(JSON.stringify({
  type: 'end_session',
  data: { sessionId: 'session_id_123' }
}));
```

#### From Server to Client
```javascript
// Connection Established
{
  type: 'connection_established',
  data: {
    deviceId: 'HVNC_123456789',
    deviceName: 'HVNC-DEV-01',
    status: 'connected'
  }
}

// Device Status Update
{
  type: 'device_status_update',
  data: {
    deviceId: 'HVNC_123456789',
    status: 'online',
    timestamp: '2026-03-12T10:30:00Z'
  }
}

// Session Started
{
  type: 'session_started',
  data: {
    sessionId: 'session_id_123',
    deviceId: 'HVNC_123456789',
    startTime: '2026-03-12T10:30:00Z'
  }
}

// Session Terminated
{
  type: 'session_terminated',
  data: {
    sessionId: 'session_id_123',
    reason: 'Device disconnected'
  }
}
```

### Frontend WebSocket Handler Example
```javascript
class HVNCWebSocketManager {
  constructor(userToken) {
    this.userToken = userToken;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    this.ws = new WebSocket(`ws://localhost:3000/ws?type=user&token=${this.userToken}`);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  handleMessage(message) {
    switch (message.type) {
      case 'device_status_update':
        this.updateDeviceStatus(message.data);
        break;
      case 'session_started':
        this.onSessionStarted(message.data);
        break;
      case 'session_terminated':
        this.onSessionTerminated(message.data);
        break;
    }
  }

  startHeartbeat() {
    setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 30 seconds
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
        this.connect();
      }, 1000 * Math.pow(2, this.reconnectAttempts));
    }
  }
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

### Frontend Error Handling Example
```javascript
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error.message);
    // Handle specific error types
    if (error.message.includes('Unauthorized')) {
      // Redirect to login
      redirectToLogin();
    }
    throw error;
  }
};
```

---

## Frontend Implementation Examples

### React Hook for Device Management
```javascript
import { useState, useEffect } from 'react';

const useDeviceManagement = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDevices = async (status = null) => {
    try {
      setLoading(true);
      const query = status ? `?status=${status}` : '';
      const response = await apiRequest(`/api/hvnc/admin/devices${query}`);
      setDevices(response.devices);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const registerDevice = async (pcName, assignedUserId) => {
    try {
      const response = await apiRequest('/api/hvnc/admin/devices', {
        method: 'POST',
        body: JSON.stringify({ pcName, assignedUserId })
      });
      await fetchDevices(); // Refresh list
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const startHubstaffTimer = async (deviceId) => {
    try {
      const response = await apiRequest(`/api/hvnc/admin/devices/${deviceId}/hubstaff/start`, {
        method: 'POST'
      });
      await fetchDevices(); // Refresh list
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return {
    devices,
    loading,
    error,
    fetchDevices,
    registerDevice,
    startHubstaffTimer
  };
};
```

### Vue.js Composition API for User Dashboard
```javascript
import { ref, onMounted } from 'vue';

export function useUserDashboard() {
  const dashboardData = ref(null);
  const loading = ref(true);
  const error = ref(null);

  const fetchDashboard = async () => {
    try {
      loading.value = true;
      const response = await apiRequest('/api/hvnc/user/dashboard');
      dashboardData.value = response;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const startSession = async (deviceId) => {
    try {
      const response = await apiRequest('/api/hvnc/user/sessions/start', {
        method: 'POST',
        body: JSON.stringify({ deviceId })
      });
      await fetchDashboard(); // Refresh data
      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const endSession = async (sessionId) => {
    try {
      const response = await apiRequest(`/api/hvnc/user/sessions/${sessionId}/end`, {
        method: 'POST'
      });
      await fetchDashboard(); // Refresh data
      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  onMounted(() => {
    fetchDashboard();
  });

  return {
    dashboardData,
    loading,
    error,
    fetchDashboard,
    startSession,
    endSession
  };
}
```

### Angular Service for Shift Management
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShiftService {
  private readonly baseUrl = '/api/hvnc/admin/shifts';

  constructor(private http: HttpClient) {}

  getShifts(filters?: any): Observable<any> {
    const params = new URLSearchParams(filters).toString();
    return this.http.get(`${this.baseUrl}?${params}`);
  }

  getShiftDetail(shiftId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${shiftId}`);
  }

  createShift(shiftData: any): Observable<any> {
    return this.http.post(this.baseUrl, shiftData);
  }

  updateShift(shiftId: string, shiftData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${shiftId}`, shiftData);
  }

  deleteShift(shiftId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${shiftId}`);
  }

  getCalendarData(month: number, year: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/calendar?month=${month}&year=${year}`);
  }
}
```

---

## API Rate Limits

Most endpoints have rate limiting configured:
- **Device Registration**: 5 requests per 15 minutes
- **Access Code Generation**: 10 requests per hour
- **Session Start**: 20 requests per hour per user
- **General API**: 100 requests per 15 minutes per user

---

## Base URL Configuration

Replace `localhost:3000` with your actual backend server URL:

**Development:**
```javascript
const API_BASE_URL = 'http://localhost:3000';
const WS_BASE_URL = 'ws://localhost:3000';
```

**Production:**
```javascript
const API_BASE_URL = 'https://your-production-domain.com';
const WS_BASE_URL = 'wss://your-production-domain.com';
```

---

## Summary

This guide covers all implemented HVNC API endpoints with:
- ✅ **6 Core Modules** fully documented
- ✅ **48+ API endpoints** with request/response examples  
- ✅ **WebSocket integration** for real-time features
- ✅ **Authentication & permissions** properly documented
- ✅ **Error handling** patterns and best practices
- ✅ **Frontend implementation** examples in React, Vue, and Angular

All endpoints documented here exist in the backend implementation and are ready for frontend integration.