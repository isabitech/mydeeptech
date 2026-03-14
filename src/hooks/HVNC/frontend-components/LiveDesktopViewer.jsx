import React, { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';

const LiveDesktopViewer = ({ 
  jwtToken, 
  deviceId, 
  sessionData,
  serverUrl = process.env.REACT_APP_BACKEND_URL || 'https://mydeeptech-be-lmrk.onrender.com'
}) => {
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [sessionInfo, setSessionInfo] = useState(null);
  const [streamStats, setStreamStats] = useState({
    fps: 0,
    frameCount: 0,
    lastFrameTime: 0,
    avgFrameSize: 0
  });

  // Connect to HVNC user namespace
  useEffect(() => {
    if (!jwtToken || !deviceId) return;

    console.log('🔌 Connecting to HVNC user namespace...');
    
    socketRef.current = io(`${serverUrl}/hvnc-user`, {
      auth: {
        token: jwtToken
      },
      transports: ['websocket'],
      upgrade: true
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Connected to HVNC user namespace');
      setIsConnected(true);
      setConnectionStatus('Connected');
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from HVNC user namespace');
      setIsConnected(false);
      setIsStreaming(false);
      setConnectionStatus('Disconnected');
    });

    // Session events
    socket.on('session_started', (data) => {
      console.log('🎮 Session started:', data);
      setSessionInfo(data);
      setConnectionStatus('Session Active');
    });

    socket.on('session_ended', (data) => {
      console.log('🛑 Session ended:', data);
      setIsStreaming(false);
      setSessionInfo(null);
      setConnectionStatus('Session Ended');
    });

    // Screen frame events
    socket.on('live_desktop_frame', handleScreenFrame);

    socket.on('session_error', (error) => {
      console.error('❌ Session error:', error);
      setConnectionStatus(`Error: ${error.error}`);
    });

    socket.on('input_error', (error) => {
      console.error('❌ Input error:', error);
    });

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [jwtToken, deviceId, serverUrl]);

  // Handle incoming screen frames
  const handleScreenFrame = useCallback((frameData) => {
    try {
      if (!frameData || !frameData.data) {
        console.error('❌ Invalid frame data received');
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the frame
        ctx.drawImage(img, 0, 0);

        // Update streaming status
        setIsStreaming(true);

        // Update stats
        const now = Date.now();
        setStreamStats(prev => ({
          fps: now - prev.lastFrameTime > 0 ? Math.round(1000 / (now - prev.lastFrameTime)) : prev.fps,
          frameCount: prev.frameCount + 1,
          lastFrameTime: now,
          avgFrameSize: Math.round((frameData.data.length * 3) / 4) // Approximate decoded size
        }));
      };

      img.onerror = (error) => {
        console.error('❌ Failed to load frame image:', error);
      };

      // Load base64 image data
      img.src = `data:image/${frameData.format || 'jpeg'};base64,${frameData.data}`;

    } catch (error) {
      console.error('❌ Screen frame handling error:', error);
    }
  }, []);

  // Start session with device
  const startSession = () => {
    if (!socketRef.current || !isConnected) {
      console.error('❌ Socket not connected');
      return;
    }

    console.log('🚀 Starting session with device:', deviceId);
    socketRef.current.emit('start_session', { device_id: deviceId });
  };

  // End current session
  const endSession = () => {
    if (!socketRef.current || !sessionInfo) return;

    console.log('🛑 Ending session:', sessionInfo.session_id);
    socketRef.current.emit('end_session', { session_id: sessionInfo.session_id });
  };

  // Handle mouse events on canvas
  const handleMouseEvent = useCallback((event) => {
    if (!socketRef.current || !sessionInfo || !isStreaming) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = Math.round((event.clientX - rect.left) * scaleX);
    const y = Math.round((event.clientY - rect.top) * scaleY);

    let action = 'move';
    let button = null;

    switch (event.type) {
      case 'mousedown':
        action = 'down';
        button = event.button === 0 ? 'left' : event.button === 1 ? 'middle' : 'right';
        break;
      case 'mouseup':
        action = 'up';
        button = event.button === 0 ? 'left' : event.button === 1 ? 'middle' : 'right';
        break;
      case 'wheel':
        action = 'wheel';
        break;
    }

    socketRef.current.emit('mouse_input', {
      session_id: sessionInfo.session_id,
      x: x,
      y: y,
      button: button,
      action: action,
      wheel_delta: event.deltaY || 0
    });

    // Prevent default browser behavior
    event.preventDefault();
  }, [sessionInfo, isStreaming]);

  // Handle keyboard events
  const handleKeyboardEvent = useCallback((event) => {
    if (!socketRef.current || !sessionInfo || !isStreaming) return;

    let action = '';
    switch (event.type) {
      case 'keydown':
        action = 'down';
        break;
      case 'keyup':
        action = 'up';
        break;
    }

    socketRef.current.emit('keyboard_input', {
      session_id: sessionInfo.session_id,
      key: event.key,
      action: action,
      modifiers: {
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey
      },
      sensitive: event.key.length === 1 && /[a-zA-Z0-9]/.test(event.key) // Basic sensitive detection
    });

    // Prevent default for most keys when streaming
    if (isStreaming && event.key !== 'F12') { // Allow F12 for dev tools
      event.preventDefault();
    }
  }, [sessionInfo, isStreaming]);

  // Set up keyboard event listeners
  useEffect(() => {
    if (isStreaming) {
      window.addEventListener('keydown', handleKeyboardEvent);
      window.addEventListener('keyup', handleKeyboardEvent);

      return () => {
        window.removeEventListener('keydown', handleKeyboardEvent);
        window.removeEventListener('keyup', handleKeyboardEvent);
      };
    }
  }, [isStreaming, handleKeyboardEvent]);

  // Control screen quality
  const setScreenQuality = (quality) => {
    if (!socketRef.current || !sessionInfo) return;

    socketRef.current.emit('screen_control', {
      session_id: sessionInfo.session_id,
      action: 'set_quality',
      parameters: { quality: quality }
    });
  };

  return (
    <div className="live-desktop-viewer">
      {/* Header with connection status and controls */}
      <div className="viewer-header" style={{ padding: '10px', background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <div className="status-info">
          <h3>Remote Desktop - {deviceId}</h3>
          <div className="status-indicators">
            <span className={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
              {connectionStatus}
            </span>
            {isStreaming && (
              <span className="streaming-badge">
                🎬 Live • {streamStats.fps} FPS • Frame #{streamStats.frameCount}
              </span>
            )}
          </div>
        </div>
        
        <div className="controls">
          {!sessionInfo && isConnected && (
            <button onClick={startSession} className="btn btn-primary">
              🚀 Start Session
            </button>
          )}
          
          {sessionInfo && (
            <>
              <button onClick={endSession} className="btn btn-danger">
                🛑 End Session
              </button>
              
              <div className="quality-controls">
                <label>Quality: </label>
                <select onChange={(e) => setScreenQuality(parseInt(e.target.value))}>
                  <option value="50">Low (50%)</option>
                  <option value="70" selected>Medium (70%)</option>
                  <option value="85">High (85%)</option>
                  <option value="95">Maximum (95%)</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Desktop canvas */}
      <div className="desktop-container" style={{ position: 'relative', overflow: 'auto', background: '#000' }}>
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 150px)',
            cursor: isStreaming ? 'none' : 'default'
          }}
          onMouseDown={handleMouseEvent}
          onMouseUp={handleMouseEvent}
          onMouseMove={handleMouseEvent}
          onWheel={handleMouseEvent}
          tabIndex={0} // Make canvas focusable for keyboard events
        />
        
        {!isStreaming && sessionInfo && (
          <div className="no-stream-overlay" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            textAlign: 'center',
            background: 'rgba(0,0,0,0.8)',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <h3>⏳ Waiting for screen data...</h3>
            <p>Make sure the PC agent is running screen capture</p>
          </div>
        )}
        
        {!sessionInfo && isConnected && (
          <div className="no-session-overlay" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            textAlign: 'center',
            background: 'rgba(0,0,0,0.8)',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <h3>🖥️ Ready to Connect</h3>
            <p>Click "Start Session" to begin remote desktop access</p>
            <button onClick={startSession} className="btn btn-primary btn-lg">
              🚀 Start Session
            </button>
          </div>
        )}
      </div>

      {/* Footer with session info */}
      {sessionInfo && (
        <div className="session-footer" style={{ padding: '10px', background: '#f9f9f9', fontSize: '12px' }}>
          <strong>Session ID:</strong> {sessionInfo.session_id} | 
          <strong> Device:</strong> {sessionInfo.device_name} | 
          <strong> Started:</strong> {new Date(sessionInfo.start_time).toLocaleTimeString()} |
          <strong> Frames:</strong> {streamStats.frameCount} |
          <strong> Avg Size:</strong> {Math.round(streamStats.avgFrameSize / 1024)}KB
        </div>
      )}

      <style jsx>{`
        .status-badge.connected {
          background: #4CAF50;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .status-badge.disconnected {
          background: #f44336;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .streaming-badge {
          background: #2196F3;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin-left: 8px;
        }
        
        .viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .quality-controls {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
        }
        
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .btn-primary {
          background: #007bff;
          color: white;
        }
        
        .btn-danger {
          background: #dc3545;
          color: white;
        }
        
        .btn-lg {
          padding: 12px 24px;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default LiveDesktopViewer;