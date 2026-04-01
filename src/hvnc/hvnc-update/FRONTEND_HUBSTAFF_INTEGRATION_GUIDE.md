# Frontend Developer - HVNC Hubstaff Integration Guide

## 🎯 What You're Building

You'll be implementing **real-time time tracking dashboards** that show actual work hours for DTUsers on HVNC devices, integrating with Hubstaff timer data.

### **Key Features to Implement:**
1. **User Dashboard** - Live timer widget and personal time tracking
2. **Admin Dashboard** - Real-time monitoring of all users across devices  
3. **Analytics Views** - Device utilization and productivity reports
4. **Real-time Updates** - WebSocket integration for live data

---

## 🔗 API Endpoints Overview

### **User Dashboard APIs**
```http
GET /api/hvnc/user/hubstaff/my-sessions
```
**Purpose**: Get user's current session + daily/weekly summary  
**Auth**: User JWT token required

### **Admin Dashboard APIs** 
```http
GET /api/hvnc/admin/hubstaff/active-sessions
GET /api/hvnc/admin/hubstaff/user-sessions/:userId
GET /api/hvnc/admin/hubstaff/device-utilization/:deviceId
GET /api/hvnc/admin/hubstaff/devices
```
**Purpose**: Real-time monitoring and analytics  
**Auth**: Admin JWT token required

### **Real-time Updates**
```javascript
WebSocket: wss://api.mydeeptech.ng/hubstaff-updates
```
**Purpose**: Live timer updates and session changes

---

## 💻 Component Implementation Guide

### **1. User Dashboard - Live Timer Widget**

#### **Component Structure:**
```jsx
const HubstaffTimerWidget = () => {
  const [currentSession, setCurrentSession] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  
  // API call to get user's sessions
  useEffect(() => {
    fetch('/api/hvnc/user/hubstaff/my-sessions', {
      headers: { 
        'Authorization': `Bearer ${getUserToken()}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setCurrentSession(data.data.currentSession);
        setDailySummary(data.data.todayTotal);
      }
    })
    .catch(err => console.error('Error fetching sessions:', err));
  }, []);
  
  return (
    <div className="hubstaff-timer-widget">
      {currentSession ? (
        <ActiveTimerDisplay session={currentSession} />
      ) : (
        <InactiveTimerDisplay />
      )}
      <DailySummary summary={dailySummary} />
    </div>
  );
};
```

#### **Active Timer Display:**
```jsx
const ActiveTimerDisplay = ({ session }) => (
  <div className="active-timer">
    <div className="status-indicator">
      <span className="green-dot">🟢</span>
      <h3>Working on Device {session.deviceId}</h3>
    </div>
    
    <div className="timer-display">
      <div className="user-time">
        <label>Your Session:</label>
        <span className="time-large">{session.currentDuration}</span>
      </div>
      <div className="hubstaff-time">
        <label>Hubstaff Timer:</label>
        <span className="time-small">{session.hubstaffTimer}</span>
      </div>
    </div>
    
    <div className="session-info">
      <p>Started at: {new Date(session.sessionStartTime).toLocaleTimeString()}</p>
      <p>Device: {session.deviceId}</p>
    </div>
  </div>
);
```

#### **Sample API Response:**
```json
{
  "success": true,
  "data": {
    "currentSession": {
      "_id": "session123",
      "deviceId": "device_789", 
      "sessionStartTime": "2026-03-16T14:00:00Z",
      "currentDuration": "02:15:30",
      "hubstaffTimer": "05:45:30",
      "isActive": true
    },
    "todayTotal": {
      "date": "2026-03-16",
      "totalWorkedHours": 6.25,
      "sessionsCount": 2,
      "devices": ["device_789"]
    },
    "weekSummary": {
      "totalHours": 35.5,
      "dailyBreakdown": [
        { "date": "Mon", "hours": 8.0 },
        { "date": "Tue", "hours": 7.5 },
        { "date": "Wed", "hours": 8.5 }
      ]
    }
  }
}
```

### **2. Admin Dashboard - Real-time Monitoring**

#### **Active Sessions Grid:**
```jsx
const AdminActiveSessionsGrid = () => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch active sessions
  const fetchActiveSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/hvnc/admin/hubstaff/active-sessions', {
        headers: { 
          'Authorization': `Bearer ${getAdminToken()}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setActiveSessions(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      setLoading(false);
    }
  }, []);
  
  // Poll every 30 seconds
  useEffect(() => {
    fetchActiveSessions();
    const interval = setInterval(fetchActiveSessions, 30000);
    return () => clearInterval(interval);
  }, [fetchActiveSessions]);
  
  if (loading) return <div>Loading active sessions...</div>;
  
  return (
    <div className="active-sessions-grid">
      <h2>Active Hubstaff Sessions ({activeSessions.length})</h2>
      
      <div className="sessions-container">
        {activeSessions.map(session => (
          <SessionCard key={session.deviceId} session={session} />
        ))}
        
        {activeSessions.length === 0 && (
          <div className="no-sessions">
            <p>No active Hubstaff sessions</p>
          </div>
        )}
      </div>
    </div>
  );
};

const SessionCard = ({ session }) => (
  <div className="session-card">
    <div className="device-header">
      <h3>{session.deviceName}</h3>
      <span className={`status-badge ${session.session.isActive ? 'active' : 'inactive'}`}>
        {session.session.isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
    
    <div className="user-info">
      <div className="user-avatar">
        {session.currentUser.firstName[0]}{session.currentUser.lastName[0]}
      </div>
      <div className="user-details">
        <strong>{session.currentUser.firstName} {session.currentUser.lastName}</strong>
        <span className="email">{session.currentUser.email}</span>
      </div>
    </div>
    
    <div className="timing-info">
      <div className="time-row">
        <span>Session Duration:</span>
        <strong>{session.session.currentDuration}</strong>
      </div>
      <div className="time-row">
        <span>Hubstaff Total:</span>
        <span>{session.hubstaffTimer.totalElapsed}</span>
      </div>
      <div className="time-row">
        <span>Started:</span>
        <span>{new Date(session.session.startTime).toLocaleTimeString()}</span>
      </div>
    </div>
  </div>
);
```

#### **Sample Admin API Response:**
```json
{
  "success": true,
  "data": [
    {
      "deviceId": "device_789",
      "deviceName": "HVNC-789",
      "currentUser": {
        "userId": "user123",
        "firstName": "John",
        "lastName": "Doe", 
        "email": "john@example.com"
      },
      "session": {
        "sessionId": "session456",
        "startTime": "2026-03-16T14:00:00Z",
        "currentDuration": "02:15:30",
        "isActive": true
      },
      "hubstaffTimer": {
        "totalElapsed": "05:45:30",
        "isActive": true
      }
    }
  ]
}
```

### **3. Device Utilization Analytics**

#### **Component Implementation:**
```jsx
const DeviceUtilizationView = ({ deviceId }) => {
  const [utilization, setUtilization] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(0);
  
  useEffect(() => {
    fetch(`/api/hvnc/admin/hubstaff/device-utilization/${deviceId}?week=${selectedWeek}`, {
      headers: { 'Authorization': `Bearer ${getAdminToken()}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setUtilization(data.data);
      }
    });
  }, [deviceId, selectedWeek]);
  
  if (!utilization) return <div>Loading...</div>;
  
  return (
    <div className="device-utilization">
      <div className="header">
        <h2>{utilization.deviceName} Utilization</h2>
        <WeekSelector value={selectedWeek} onChange={setSelectedWeek} />
      </div>
      
      <div className="stats-overview">
        <StatCard 
          title="Today's Hours"
          value={`${utilization.today.totalHubstaffHours}h`}
          color="blue"
        />
        <StatCard 
          title="Active Users"
          value={utilization.today.activeUsers}
          color="green"
        />
        <StatCard 
          title="Week Total"
          value={`${utilization.weekSummary.totalHours}h`}
          color="purple"
        />
        <StatCard 
          title="Utilization Rate"
          value={`${utilization.weekSummary.utilizationRate}%`}
          color="orange"
        />
      </div>
      
      <div className="today-sessions">
        <h3>Today's Sessions</h3>
        <SessionsTimeline sessions={utilization.today.sessions} />
      </div>
    </div>
  );
};

const SessionsTimeline = ({ sessions }) => (
  <div className="sessions-timeline">
    {sessions.map((session, index) => (
      <div key={index} className="session-bar">
        <div className="user-info">
          <span className="user-name">{session.userName}</span>
          <span className="duration">{session.workedHours}h</span>
        </div>
        <div className="time-range">
          {session.startTime} - {session.endTime}
        </div>
      </div>
    ))}
  </div>
);
```

---

## 🔄 WebSocket Integration for Real-time Updates

### **Setup WebSocket Connection:**
```javascript
class HubstaffRealtimeService {
  constructor(userToken, isAdmin = false) {
    this.userToken = userToken;
    this.isAdmin = isAdmin;
    this.listeners = new Map();
  }
  
  connect() {
    this.ws = new WebSocket('wss://api.mydeeptech.ng/hubstaff-updates');
    
    this.ws.onopen = () => {
      // Join appropriate room
      if (this.isAdmin) {
        this.ws.send(JSON.stringify({
          type: 'join-admin',
          isAdmin: true,
          token: this.userToken
        }));
      } else {
        this.ws.send(JSON.stringify({
          type: 'join-user',
          userId: this.getUserId(),
          token: this.userToken
        }));
      }
    };
    
    this.ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      this.handleUpdate(update);
    };
    
    this.ws.onclose = () => {
      // Reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    };
  }
  
  handleUpdate(update) {
    const { type } = update;
    
    switch (type) {
      case 'TIMER_UPDATE':
        this.emit('timer-update', update);
        break;
      case 'session-started':
        this.emit('session-start', update);
        break;
      case 'session-ended':
        this.emit('session-end', update);
        break;
    }
  }
  
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }
}
```

### **Using WebSocket in Components:**
```jsx
const AdminDashboard = () => {
  const [realtimeService] = useState(() => 
    new HubstaffRealtimeService(getAdminToken(), true)
  );
  
  useEffect(() => {
    realtimeService.connect();
    
    realtimeService.on('timer-update', (update) => {
      // Update active sessions in real-time
      setActiveSessions(update.activeSessions);
    });
    
    realtimeService.on('session-start', (update) => {
      showNotification(`${update.userName} started work on ${update.deviceName}`);
    });
    
    realtimeService.on('session-end', (update) => {
      showNotification(`${update.userName} ended work session (${update.duration})`);
    });
    
    return () => realtimeService.disconnect();
  }, [realtimeService]);
  
  // Component JSX...
};
```

---

## 🎨 CSS Styling Recommendations

### **Timer Widget Styling:**
```css
.hubstaff-timer-widget {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-bottom: 24px;
}

.active-timer {
  text-align: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.green-dot {
  margin-right: 8px;
  font-size: 12px;
}

.timer-display {
  display: flex;
  justify-content: space-around;
  margin: 24px 0;
}

.time-large {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2563eb;
  display: block;
}

.time-small {
  font-size: 1.2rem;
  color: #6b7280;
  display: block;
}

.session-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 16px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #dc2626;
}
```

### **Responsive Design:**
```css
@media (max-width: 768px) {
  .sessions-container {
    grid-template-columns: 1fr;
  }
  
  .timer-display {
    flex-direction: column;
    gap: 16px;
  }
  
  .time-large {
    font-size: 2rem;
  }
}
```

---

## 🚀 Implementation Steps

### **Week 1: User Dashboard**
1. ✅ Set up API integration service
2. ✅ Build live timer widget component
3. ✅ Implement daily/weekly summary views
4. ✅ Add error handling and loading states

### **Week 2: Admin Dashboard** 
1. ✅ Create active sessions grid
2. ✅ Build real-time monitoring interface
3. ✅ Implement device utilization analytics
4. ✅ Add admin notification system

### **Week 3: Real-time Features**
1. ✅ Integrate WebSocket connections
2. ✅ Add live updates to all components
3. ✅ Implement notification system
4. ✅ Add offline/reconnection handling

### **Week 4: Polish & Testing**
1. ✅ Mobile responsiveness
2. ✅ Performance optimization
3. ✅ Error boundary implementation
4. ✅ User testing and feedback

---

## 🔧 State Management Recommendations

### **Redux Store Structure:**
```javascript
const hubstaffState = {
  user: {
    currentSession: null,
    dailySummary: null,
    weekSummary: null,
    loading: false,
    error: null
  },
  admin: {
    activeSessions: [],
    deviceUtilization: {},
    loading: false,
    error: null
  },
  realtime: {
    connected: false,
    lastUpdate: null
  }
};
```

### **API Integration Utilities:**
```javascript
// api/hubstaff.js
export const hubstaffAPI = {
  // User endpoints
  getUserSessions: () => 
    fetch('/api/hvnc/user/hubstaff/my-sessions', { 
      headers: authHeaders() 
    }).then(res => res.json()),
  
  // Admin endpoints  
  getActiveSessions: () =>
    fetch('/api/hvnc/admin/hubstaff/active-sessions', {
      headers: adminAuthHeaders()
    }).then(res => res.json()),
    
  getDeviceUtilization: (deviceId, week = 0) =>
    fetch(`/api/hvnc/admin/hubstaff/device-utilization/${deviceId}?week=${week}`, {
      headers: adminAuthHeaders() 
    }).then(res => res.json())
};
```

---

This guide provides everything needed to implement the HVNC Hubstaff integration frontend. Focus on the user dashboard first for immediate user value, then build out the admin monitoring capabilities.