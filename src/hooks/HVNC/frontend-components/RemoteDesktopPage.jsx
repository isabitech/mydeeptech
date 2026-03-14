import React, { useState, useEffect } from 'react';
import LiveDesktopViewer from './LiveDesktopViewer';

const RemoteDesktopPage = () => {
  const [jwtToken, setJwtToken] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [sessionData, setSessionData] = useState(null);

  // Get JWT token from your authentication system
  useEffect(() => {
    // Replace this with your actual token retrieval logic
    const token = localStorage.getItem('authToken') || 
                  sessionStorage.getItem('jwtToken') ||
                  // From your session validation response:
                  getTokenFromSessionValidation();
    
    setJwtToken(token);
  }, []);

  // Example function to get token from your session validation
  const getTokenFromSessionValidation = () => {
    // This matches your current session validation response format
    const sessionResponse = {
      "valid": true,
      "session": {
        "session_id": "sess_sh2ncgz0c_1773483954783",
        "user": {
          "email": "dammykolaceo@gmail.com",
          "name": "Damilola Kolawole",
          "role": "user"
        },
        "expires_at": "2026-03-14T18:25:55.448Z"
      },
      "shift": {
        "start_time": "00:00",
        "end_time": "23:59",
        "timezone": "UTC",
        "remaining_minutes": 0
      }
    };

    // Generate or retrieve JWT token for this session
    // You might need to call an endpoint to get a JWT token for HVNC access
    return generateHVNCToken(sessionResponse.session);
  };

  // Fetch available devices for the user
  useEffect(() => {
    if (!jwtToken) return;

    fetch('/api/hvnc/user/devices', {
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.devices) {
        setAvailableDevices(data.devices);
      }
    })
    .catch(err => console.error('Failed to fetch devices:', err));
  }, [jwtToken]);

  // Generate HVNC token (you'll need to implement this endpoint)
  const generateHVNCToken = async (sessionData) => {
    try {
      const response = await fetch('/api/hvnc/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionData.session_id,
          user_email: sessionData.user.email,
          user_name: sessionData.user.name
        })
      });

      const result = await response.json();
      return result.token;
    } catch (error) {
      console.error('Failed to generate HVNC token:', error);
      return null;
    }
  };

  if (!jwtToken) {
    return (
      <div className="loading-container">
        <h3>🔐 Authenticating...</h3>
        <p>Please wait while we validate your session.</p>
      </div>
    );
  }

  if (!selectedDevice) {
    return (
      <div className="device-selection">
        <h2>🖥️ Select Remote Desktop</h2>
        
        {availableDevices.length === 0 ? (
          <div className="no-devices">
            <h3>No devices available</h3>
            <p>Contact your administrator to assign devices to your account.</p>
          </div>
        ) : (
          <div className="device-grid">
            {availableDevices.map(device => (
              <div 
                key={device.device_id} 
                className={`device-card ${device.status}`}
                onClick={() => device.status === 'online' ? setSelectedDevice(device) : null}
              >
                <div className="device-header">
                  <h3>{device.pc_name}</h3>
                  <span className={`status-indicator ${device.status}`}>
                    {device.status === 'online' ? '🟢' : '🔴'} {device.status}
                  </span>
                </div>
                
                <div className="device-details">
                  <p><strong>Device ID:</strong> {device.device_id}</p>
                  <p><strong>Last Seen:</strong> {device.last_seen ? new Date(device.last_seen).toLocaleString() : 'Never'}</p>
                </div>
                
                <div className="device-actions">
                  {device.status === 'online' ? (
                    <button className="btn btn-primary">
                      🚀 Connect
                    </button>
                  ) : (
                    <button className="btn btn-disabled" disabled>
                      ⏸️ Offline
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <style jsx>{`
          .device-selection {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .device-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
          }
          
          .device-card {
            border: 2px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            background: white;
          }
          
          .device-card:hover {
            border-color: #007bff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .device-card.offline {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          .device-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }
          
          .device-header h3 {
            margin: 0;
            color: #333;
          }
          
          .status-indicator.online {
            color: #28a745;
            font-weight: bold;
          }
          
          .status-indicator.offline {
            color: #dc3545;
            font-weight: bold;
          }
          
          .device-details p {
            margin: 4px 0;
            font-size: 14px;
            color: #666;
          }
          
          .device-actions {
            margin-top: 12px;
          }
          
          .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
          }
          
          .btn-primary {
            background: #007bff;
            color: white;
          }
          
          .btn-disabled {
            background: #6c757d;
            color: white;
            cursor: not-allowed;
          }
          
          .no-devices {
            text-align: center;
            padding: 60px 20px;
            color: #666;
          }
          
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="remote-desktop-container">
      {/* Back button */}
      <div className="navigation">
        <button 
          onClick={() => setSelectedDevice(null)}
          className="btn-back"
        >
          ← Back to Device List
        </button>
      </div>

      {/* Live Desktop Viewer */}
      <LiveDesktopViewer
        jwtToken={jwtToken}
        deviceId={selectedDevice.device_id}
        sessionData={sessionData}
        serverUrl={process.env.REACT_APP_BACKEND_URL}
      />

      <style jsx>{`
        .remote-desktop-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .navigation {
          padding: 10px 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
        }
        
        .btn-back {
          background: #6c757d;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .btn-back:hover {
          background: #5a6268;
        }
      `}</style>
    </div>
  );
};

export default RemoteDesktopPage;