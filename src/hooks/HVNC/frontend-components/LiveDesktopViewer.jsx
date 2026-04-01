import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import io from "socket.io-client";

const LiveDesktopViewer = ({
  jwtToken,
  deviceId,
  sessionData,
  serverUrl =
    process.env.REACT_APP_BACKEND_URL ||
    "https://mydeeptech-be-lmrk.onrender.com",
}) => {
  const canvasRef    = useRef(null);
  const socketRef    = useRef(null);

  // ── Audio refs (not state — no re-render needed) ──────────────────────────
  const audioCtxRef     = useRef(null);   // Web AudioContext
  const nextPlayTimeRef = useRef(0);      // Scheduled end of last audio chunk
  const isMutedRef      = useRef(false);  // Mute flag (synced with isMuted state)
  const gainNodeRef     = useRef(null);   // GainNode for mute/volume

  // ── React state ───────────────────────────────────────────────────────────
  const [isConnected,     setIsConnected]     = useState(false);
  const [isStreaming,     setIsStreaming]      = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [sessionInfo,     setSessionInfo]     = useState(null);
  const [isMuted,         setIsMuted]         = useState(false);
  const [streamStats,     setStreamStats]     = useState({
    fps: 0, frameCount: 0, lastFrameTime: 0, avgFrameSize: 0,
  });

  // ── Initialise (or resume) AudioContext on first user gesture ─────────────
  const ensureAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const gain = ctx.createGain();
      gain.gain.value = isMutedRef.current ? 0 : 1;
      gain.connect(ctx.destination);
      audioCtxRef.current = ctx;
      gainNodeRef.current = gain;
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  }, []);

  // ── Handle incoming audio chunks ──────────────────────────────────────────
  const handleAudioFrame = useCallback((frameData) => {
    if (!frameData?.data) return;
    if (!audioCtxRef.current) return;

    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    try {
      // Decode base64 → raw bytes
      const binary   = atob(frameData.data);
      const bytes    = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      // PCM S16LE → Float32
      const sampleRate = frameData.sample_rate || 44100;
      const channels   = frameData.channels    || 2;
      const int16      = new Int16Array(bytes.buffer);
      const samplesPerCh = Math.floor(int16.length / channels);
      if (samplesPerCh === 0) return;

      const audioBuf = ctx.createBuffer(channels, samplesPerCh, sampleRate);
      for (let c = 0; c < channels; c++) {
        const ch = audioBuf.getChannelData(c);
        for (let i = 0; i < samplesPerCh; i++) {
          ch[i] = int16[i * channels + c] / 32768;
        }
      }

      // Schedule playback — keep chunks gapless
      const now  = ctx.currentTime;
      const when = Math.max(now + 0.05, nextPlayTimeRef.current); // 50 ms minimum buffer
      const src  = ctx.createBufferSource();
      src.buffer = audioBuf;
      src.connect(gainNodeRef.current);
      src.start(when);
      nextPlayTimeRef.current = when + audioBuf.duration;
    } catch (e) {
      // Malformed chunk — skip silently
    }
  }, []);

  // ── Handle incoming video frames ──────────────────────────────────────────
  const handleScreenFrame = useCallback((frameData) => {
    if (!frameData?.data) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Resize canvas only when dimensions change
      if (canvas.width !== img.width || canvas.height !== img.height) {
        canvas.width  = img.width;
        canvas.height = img.height;
      }
      ctx.drawImage(img, 0, 0);
      setIsStreaming(true);

      const now = Date.now();
      setStreamStats((prev) => ({
        fps:
          now - prev.lastFrameTime > 0
            ? Math.round(1000 / (now - prev.lastFrameTime))
            : prev.fps,
        frameCount:   prev.frameCount + 1,
        lastFrameTime: now,
        avgFrameSize:  Math.round((frameData.data.length * 3) / 4),
      }));
    };

    img.src = `data:image/${frameData.format || "jpeg"};base64,${frameData.data}`;
  }, []);

  // ── Socket.IO connection ───────────────────────────────────────────────────
  useEffect(() => {
    if (!jwtToken || !deviceId) return;

    socketRef.current = io(`${serverUrl}/hvnc-user`, {
      auth: { token: jwtToken },
      transports: ["websocket"],
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionStatus("Connected");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setIsStreaming(false);
      setConnectionStatus("Disconnected");
    });

    socket.on("session_started", (data) => {
      setSessionInfo(data);
      setConnectionStatus("Session Active");
      ensureAudioContext();          // Prime audio context on session start
    });

    socket.on("session_ended", () => {
      setIsStreaming(false);
      setSessionInfo(null);
      setConnectionStatus("Session Ended");
    });

    socket.on("live_desktop_frame", handleScreenFrame);
    socket.on("live_audio_frame",   handleAudioFrame);

    socket.on("session_error", (err) =>
      setConnectionStatus(`Error: ${err.error}`));

    return () => socket.disconnect();
  }, [jwtToken, deviceId, serverUrl, handleScreenFrame, handleAudioFrame, ensureAudioContext]);

  // ── Keyboard listeners ────────────────────────────────────────────────────
  const handleKeyboardEvent = useCallback(
    (event) => {
      if (!socketRef.current || !sessionInfo || !isStreaming) return;

      socketRef.current.emit("keyboard_input", {
        session_id: sessionInfo.session_id,
        key:        event.key,
        action:     event.type === "keydown" ? "down" : "up",
        modifiers: {
          ctrl:  event.ctrlKey,
          alt:   event.altKey,
          shift: event.shiftKey,
          meta:  event.metaKey,
        },
        sensitive: event.key.length === 1 && /[a-zA-Z0-9]/.test(event.key),
      });

      if (event.key !== "F12") event.preventDefault();
    },
    [sessionInfo, isStreaming],
  );

  useEffect(() => {
    if (!isStreaming) return;
    window.addEventListener("keydown", handleKeyboardEvent);
    window.addEventListener("keyup",   handleKeyboardEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyboardEvent);
      window.removeEventListener("keyup",   handleKeyboardEvent);
    };
  }, [isStreaming, handleKeyboardEvent]);

  // ── Mouse events ──────────────────────────────────────────────────────────
  const handleMouseEvent = useCallback(
    (event) => {
      if (!socketRef.current || !sessionInfo || !isStreaming) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Ensure audio starts on first interaction (browser policy)
      ensureAudioContext();

      const rect   = canvas.getBoundingClientRect();
      const scaleX = canvas.width  / rect.width;
      const scaleY = canvas.height / rect.height;
      const x      = Math.round((event.clientX - rect.left)  * scaleX);
      const y      = Math.round((event.clientY - rect.top)   * scaleY);

      let action = "move";
      let button = null;

      if (event.type === "mousedown" || event.type === "mouseup") {
        action = event.type === "mousedown" ? "down" : "up";
        button = event.button === 0 ? "left" : event.button === 2 ? "right" : "middle";
      } else if (event.type === "wheel") {
        action = "wheel";
      }

      socketRef.current.emit("mouse_input", {
        session_id:  sessionInfo.session_id,
        x, y, button, action,
        wheel_delta: event.deltaY || 0,
      });

      event.preventDefault();
    },
    [sessionInfo, isStreaming, ensureAudioContext],
  );

  // ── Session controls ──────────────────────────────────────────────────────
  const startSession = () => {
    if (!socketRef.current || !isConnected) return;
    socketRef.current.emit("start_session", { device_id: deviceId });
  };

  const endSession = () => {
    if (!socketRef.current || !sessionInfo) return;
    socketRef.current.emit("end_session", { session_id: sessionInfo.session_id });
  };

  const setScreenQuality = (quality) => {
    if (!socketRef.current || !sessionInfo) return;
    socketRef.current.emit("screen_control", {
      session_id: sessionInfo.session_id,
      action:     "set_quality",
      parameters: { quality },
    });
  };

  const setScreenFPS = (fps) => {
    if (!socketRef.current || !sessionInfo) return;
    socketRef.current.emit("screen_control", {
      session_id: sessionInfo.session_id,
      action:     "set_fps",
      parameters: { fps },
    });
  };

  const toggleMute = () => {
    isMutedRef.current = !isMutedRef.current;
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMutedRef.current ? 0 : 1;
    }
    setIsMuted(isMutedRef.current);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="live-desktop-viewer">
      {/* ── Header ── */}
      <div className="viewer-header">
        <div className="status-info">
          <h3>Remote Desktop — {deviceId}</h3>
          <div className="status-indicators">
            <span className={`status-badge ${isConnected ? "connected" : "disconnected"}`}>
              {connectionStatus}
            </span>
            {isStreaming && (
              <span className="streaming-badge">
                🎬 {streamStats.fps} FPS &nbsp;|&nbsp; Frame #{streamStats.frameCount}
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

              {/* Mute toggle */}
              <button onClick={toggleMute} className="btn btn-secondary">
                {isMuted ? "🔇 Unmute" : "🔊 Mute"}
              </button>

              {/* Quality */}
              <div className="quality-controls">
                <label>Quality:</label>
                <select onChange={(e) => setScreenQuality(parseInt(e.target.value))}>
                  <option value="50">Low 50%</option>
                  <option value="70" defaultValue>Med 70%</option>
                  <option value="85">High 85%</option>
                  <option value="95">Max 95%</option>
                </select>
              </div>

              {/* FPS */}
              <div className="quality-controls">
                <label>FPS:</label>
                <select defaultValue="20" onChange={(e) => setScreenFPS(parseInt(e.target.value))}>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                  <option value="25">25</option>
                  <option value="30">30</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Canvas ── */}
      <div className="desktop-container">
        <canvas
          ref={canvasRef}
          style={{
            display:   "block",
            maxWidth:  "100%",
            maxHeight: "calc(100vh - 150px)",
            // Hide the browser cursor — the remote cursor is drawn into each frame
            cursor: isStreaming ? "none" : "default",
          }}
          onMouseDown={handleMouseEvent}
          onMouseUp={handleMouseEvent}
          onMouseMove={handleMouseEvent}
          onWheel={handleMouseEvent}
          onContextMenu={(e) => e.preventDefault()}
          tabIndex={0}
        />

        {!isStreaming && sessionInfo && (
          <div className="overlay">
            <h3>⏳ Waiting for screen data…</h3>
            <p>PC agent should be sending frames shortly.</p>
          </div>
        )}

        {!sessionInfo && isConnected && (
          <div className="overlay">
            <h3>🖥️ Ready to Connect</h3>
            <p>Click Start Session to begin.</p>
            <button onClick={startSession} className="btn btn-primary btn-lg">
              🚀 Start Session
            </button>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      {sessionInfo && (
        <div className="session-footer">
          <strong>Session:</strong> {sessionInfo.session_id} &nbsp;|&nbsp;
          <strong>Device:</strong> {sessionInfo.device_name} &nbsp;|&nbsp;
          <strong>Started:</strong> {new Date(sessionInfo.start_time).toLocaleTimeString()} &nbsp;|&nbsp;
          <strong>Frames:</strong> {streamStats.frameCount} &nbsp;|&nbsp;
          <strong>Avg Size:</strong> {Math.round(streamStats.avgFrameSize / 1024)} KB &nbsp;|&nbsp;
          <strong>Audio:</strong> {isMuted ? "🔇 Muted" : "🔊 Live"}
        </div>
      )}

      <style jsx>{`
        .live-desktop-viewer { font-family: sans-serif; }

        .viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: #f5f5f5;
          border-bottom: 1px solid #ddd;
        }

        .status-indicators { display: flex; align-items: center; gap: 8px; margin-top: 4px; }

        .status-badge {
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: white;
        }
        .status-badge.connected    { background: #4caf50; }
        .status-badge.disconnected { background: #f44336; }

        .streaming-badge {
          background: #2196f3;
          color: white;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

        .quality-controls {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
        }
        .quality-controls select { font-size: 12px; padding: 2px 4px; }

        .btn {
          padding: 7px 14px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        }
        .btn-primary   { background: #007bff; color: white; }
        .btn-danger    { background: #dc3545; color: white; }
        .btn-secondary { background: #6c757d; color: white; }
        .btn-lg        { padding: 11px 22px; font-size: 15px; }

        .desktop-container {
          position: relative;
          overflow: auto;
          background: #000;
        }

        .overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          text-align: center;
          background: rgba(0,0,0,0.8);
          padding: 24px 32px;
          border-radius: 8px;
        }

        .session-footer {
          padding: 8px 14px;
          background: #f9f9f9;
          font-size: 12px;
          border-top: 1px solid #ddd;
        }
      `}</style>
    </div>
  );
};

export default LiveDesktopViewer;
