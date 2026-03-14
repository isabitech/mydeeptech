import React, { useEffect, useRef, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { retrieveTokenFromStorage } from '../../../../helpers';
import {
  DesktopOutlined,
  SearchOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  DashboardOutlined,
  GlobalOutlined,
  FolderOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  PoweroffOutlined,
  PauseOutlined,
  CodeOutlined,
  TableOutlined,
  UserOutlined,
  ExportOutlined,
  LoadingOutlined,
  WifiOutlined,
  DisconnectOutlined,
} from '@ant-design/icons';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  accessCode: string;
  onDisconnect: () => void;
  sessionId?: string;
  initialHubstaffSecs?: number;
  initialSessionSecs?: number;
  onTerminate?: (sessionId: string) => Promise<{ success: boolean }>;
  onPauseHubstaff?: (sessionId: string) => Promise<{ success: boolean }>;
  jwtToken?: string;
  deviceId?: string;
  validatedSessionId?: string;
}

interface StreamStats {
  fps: number;
  frameCount: number;
  lastFrameTime: number;
  avgFrameSize: number;
}

interface RemoteSessionInfo {
  session_id: string;
  device_name?: string;
  start_time?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (totalSeconds: number): string => {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const SERVER_URL =
  (import.meta as any).env?.VITE_BACKEND_URL ||
  (window as any).__ENV__?.REACT_APP_BACKEND_URL ||
  'https://mydeeptech-be-lmrk.onrender.com';

// ─── Main Component ───────────────────────────────────────────────────────────

const UserHVNCSession: React.FC<Props> = ({
  onDisconnect,
  sessionId,
  initialHubstaffSecs = 0,
  initialSessionSecs  = 0,
  onTerminate,
  onPauseHubstaff,
  jwtToken,
  deviceId,
  validatedSessionId,
}) => {
  // ── Timers ──────────────────────────────────────────────────────────────────
  const [hubstaffSecs, setHubstaffSecs] = useState(initialHubstaffSecs);
  const [sessionSecs, setSessionSecs]   = useState(initialSessionSecs);
  const [hubstaffPaused, setHubstaffPaused] = useState(false);
  const [activeNav, setActiveNav] = useState('Sessions');

  // ── Socket / stream state ────────────────────────────────────────────────────
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const socketRef    = useRef<Socket | null>(null);
  const [isConnected,      setIsConnected]      = useState(false);
  const [isStreaming,      setIsStreaming]       = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...');
  const [remoteSession,    setRemoteSession]     = useState<RemoteSessionInfo | null>(null);
  const [streamQuality,    setStreamQuality]     = useState(70);
  const [streamStats, setStreamStats] = useState<StreamStats>({
    fps: 0, frameCount: 0, lastFrameTime: 0, avgFrameSize: 0,
  });

  // ── Hubstaff + session timers ─────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      if (!hubstaffPaused) setHubstaffSecs((s) => s + 1);
      setSessionSecs((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [hubstaffPaused]);

  // ── Screen frame handler ──────────────────────────────────────────────────
  const handleScreenFrame = useCallback((frameData: { data: string; format?: string }) => {
    if (!frameData?.data) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width  = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      setIsStreaming(true);

      const now = Date.now();
      setStreamStats((prev) => ({
        fps: prev.lastFrameTime > 0
          ? Math.round(1000 / Math.max(now - prev.lastFrameTime, 1))
          : prev.fps,
        frameCount: prev.frameCount + 1,
        lastFrameTime: now,
        avgFrameSize: Math.round((frameData.data.length * 3) / 4),
      }));
    };
    img.src = `data:image/${frameData.format ?? 'jpeg'};base64,${frameData.data}`;
  }, []);

  // ── Socket.IO connection ──────────────────────────────────────────────────
  useEffect(() => {
    if (!deviceId) {
      setConnectionStatus('Missing device ID');
      return;
    }

    let socket: Socket;

    const connect = async () => {
      // Use the app's Bearer token for socket auth (falls back to jwtToken prop)
      const appToken = await retrieveTokenFromStorage().catch(() => null);
      const authToken = appToken ?? jwtToken;

      if (!authToken) {
        setConnectionStatus('Missing auth token');
        return;
      }

      const socket = io(`${SERVER_URL}/hvnc-user`, {
        auth: { token: authToken },
        query: {
          ...(validatedSessionId && { session_id: validatedSessionId }),
        },
        transports: ['websocket'],
        upgrade: true,
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        setIsConnected(true);
        setConnectionStatus('Connected');
        socket.emit('start_session', {
          device_id: deviceId,
          ...(validatedSessionId && { session_id: validatedSessionId }),
        });
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        setIsStreaming(false);
        setConnectionStatus('Disconnected');
      });

      socket.on('session_started', (data: RemoteSessionInfo) => {
        setRemoteSession(data);
        setConnectionStatus('Session Active');
      });

      socket.on('session_ended', () => {
        setIsStreaming(false);
        setRemoteSession(null);
        setConnectionStatus('Session Ended');
      });

      socket.on('live_desktop_frame', handleScreenFrame);

      socket.on('session_error', (err: { error: string }) => {
        setConnectionStatus(`Error: ${err.error}`);
      });

      socket.on('connect_error', (err: Error) => {
        setConnectionStatus(`Connection failed: ${err.message}`);
      });
    };

    connect();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [jwtToken, deviceId, validatedSessionId, handleScreenFrame]);

  // ── Keyboard events (while streaming) ────────────────────────────────────
  const handleKeyboardEvent = useCallback((event: KeyboardEvent) => {
    if (!socketRef.current || !remoteSession || !isStreaming) return;

    const action = event.type === 'keydown' ? 'down' : 'up';
    socketRef.current.emit('keyboard_input', {
      session_id: remoteSession.session_id,
      key: event.key,
      action,
      modifiers: {
        ctrl:  event.ctrlKey,
        alt:   event.altKey,
        shift: event.shiftKey,
        meta:  event.metaKey,
      },
      sensitive: event.key.length === 1 && /[a-zA-Z0-9]/.test(event.key),
    });

    if (event.key !== 'F12') event.preventDefault();
  }, [remoteSession, isStreaming]);

  useEffect(() => {
    if (!isStreaming) return;
    window.addEventListener('keydown', handleKeyboardEvent);
    window.addEventListener('keyup',   handleKeyboardEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyboardEvent);
      window.removeEventListener('keyup',   handleKeyboardEvent);
    };
  }, [isStreaming, handleKeyboardEvent]);

  // ── Mouse events on canvas ────────────────────────────────────────────────
  const handleMouseEvent = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.WheelEvent<HTMLCanvasElement>) => {
    if (!socketRef.current || !remoteSession || !isStreaming) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((event.clientX - rect.left) * scaleX);
    const y = Math.round((event.clientY - rect.top)  * scaleY);

    let action: string = 'move';
    let button: string | null = null;

    switch (event.type) {
      case 'mousedown':
        action = 'down';
        button = (event as React.MouseEvent).button === 0 ? 'left'
               : (event as React.MouseEvent).button === 1 ? 'middle' : 'right';
        break;
      case 'mouseup':
        action = 'up';
        button = (event as React.MouseEvent).button === 0 ? 'left'
               : (event as React.MouseEvent).button === 1 ? 'middle' : 'right';
        break;
      case 'wheel':
        action = 'wheel';
        break;
    }

    socketRef.current.emit('mouse_input', {
      session_id:  remoteSession.session_id,
      x, y, button, action,
      wheel_delta: (event as React.WheelEvent).deltaY ?? 0,
    });

    event.preventDefault();
  }, [remoteSession, isStreaming]);

  // ── Quality control ───────────────────────────────────────────────────────
  const handleQualityChange = (quality: number) => {
    setStreamQuality(quality);
    if (!socketRef.current || !remoteSession) return;
    socketRef.current.emit('screen_control', {
      session_id: remoteSession.session_id,
      action: 'set_quality',
      parameters: { quality },
    });
  };

  // ── Session actions ───────────────────────────────────────────────────────
  const handleEndRemoteSession = () => {
    if (!socketRef.current || !remoteSession) return;
    socketRef.current.emit('end_session', { session_id: remoteSession.session_id });
  };

  const handlePauseHubstaff = async () => {
    if (sessionId && onPauseHubstaff) await onPauseHubstaff(sessionId);
    setHubstaffPaused((prev) => !prev);
  };

  const handleTerminate = async () => {
    handleEndRemoteSession();
    if (sessionId && onTerminate) await onTerminate(sessionId);
    onDisconnect();
  };

  // ── Connection status badge ───────────────────────────────────────────────
  const statusColor = isStreaming
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : isConnected
    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    : 'bg-red-500/20 text-red-400 border-red-500/30';

  const StatusIcon = isStreaming
    ? WifiOutlined
    : isConnected
    ? LoadingOutlined
    : DisconnectOutlined;

  return (
    <div className="flex flex-col h-full font-[gilroy-regular] text-slate-100" style={{ background: '#1a1a1a' }}>

      {/* ── Top Header ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between border-b border-white/10 bg-[#2B2B2B] px-6 py-2.5 shrink-0">
        {/* Left */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <DesktopOutlined className="text-[#F6921E] text-2xl" />
            <h2 className="text-white text-base font-bold tracking-tight">Connected Desktop</h2>
          </div>
          <nav className="hidden md:flex items-center gap-5">
            {['Sessions', 'Applications', 'Settings'].map((item) => (
              <button
                key={item}
                onClick={() => setActiveNav(item)}
                className={`text-sm font-semibold pb-1 border-b-2 transition-colors
                  ${activeNav === item
                    ? 'text-[#F6921E] border-[#F6921E]'
                    : 'text-slate-400 border-transparent hover:text-[#F6921E]'}`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Stream status badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${statusColor}`}>
            <StatusIcon className="text-xs" />
            {connectionStatus}
            {isStreaming && (
              <span className="ml-1 opacity-70">• {streamStats.fps} FPS</span>
            )}
          </div>
          <div className="relative hidden sm:block w-48">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              className="w-full rounded-lg border-none bg-slate-800 py-2 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F6921E]/40"
              placeholder="Search sessions..."
            />
          </div>
          <button className="flex items-center justify-center rounded-lg h-9 w-9 bg-slate-800 text-slate-300 hover:text-[#F6921E] hover:bg-[#F6921E]/10 transition-all">
            <BellOutlined className="text-base" />
          </button>
          <button className="flex items-center justify-center rounded-lg h-9 w-9 bg-slate-800 text-slate-300 hover:text-[#F6921E] hover:bg-[#F6921E]/10 transition-all">
            <QuestionCircleOutlined className="text-base" />
          </button>
          <div className="h-9 w-9 rounded-full border-2 border-[#F6921E] bg-[#F6921E]/20 flex items-center justify-center">
            <UserOutlined className="text-[#F6921E] text-base" />
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Sidebar ─────────────────────────────────────────── */}
        <aside className="hidden lg:flex w-64 shrink-0 border-r border-white/5 bg-[#2B2B2B] flex-col justify-between p-4">
          <div className="flex flex-col gap-6">

            {/* Active Session */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 px-2">
                Active Session
              </h3>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#F6921E] text-white cursor-pointer">
                <ExportOutlined className="text-base" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold leading-tight">
                    {remoteSession?.device_name ?? deviceId ?? 'Remote Desktop'}
                  </span>
                  <span className="text-[10px] opacity-70 uppercase tracking-tighter">
                    {isStreaming ? 'Live Stream' : isConnected ? 'Initializing...' : 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Access */}
            <div className="flex flex-col gap-1">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 px-2">
                Quick Access
              </h3>
              {[
                { icon: <DashboardOutlined />, label: 'Main Dashboard' },
                { icon: <GlobalOutlined />,   label: 'Edge Browser' },
                { icon: <FolderOutlined />,   label: 'File Explorer' },
                { icon: <FileTextOutlined />, label: 'Workspace Docs' },
              ].map((item) => (
                <button
                  key={item.label}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#F6921E]/10 hover:text-[#F6921E] transition-all text-sm font-medium"
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>

            {/* Hubstaff Timer */}
            <div className="pt-4 border-t border-[#F6921E]/10">
              <div className="bg-[#F6921E]/10 border border-[#F6921E]/20 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                    {hubstaffPaused ? 'Hubstaff Paused' : 'Hubstaff Running'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-emerald-400 tabular-nums">
                  {formatTime(hubstaffSecs)}
                </div>
              </div>
            </div>

            {/* Stream quality selector */}
            {remoteSession && (
              <div className="flex flex-col gap-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2">
                  Stream Quality
                </h3>
                <select
                  value={streamQuality}
                  onChange={(e) => handleQualityChange(Number(e.target.value))}
                  className="w-full bg-[#333333] border border-slate-700 rounded-lg text-xs text-white py-2 px-3 outline-none focus:border-[#F6921E]"
                >
                  <option value={50}>Low (50%)</option>
                  <option value={70}>Medium (70%)</option>
                  <option value={85}>High (85%)</option>
                  <option value={95}>Maximum (95%)</option>
                </select>
              </div>
            )}
          </div>

          <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#333333] py-3 px-4 text-white text-sm font-bold hover:bg-[#444444] transition-all border border-white/10">
            <PlusOutlined /> New Session
          </button>
        </aside>

        {/* ── Main Workspace — Live Canvas ─────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* ── Live Desktop Canvas ──────────────────────────────────── */}
          <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
            {/* Canvas — always rendered so the ref is available */}
            <canvas
              ref={canvasRef}
              tabIndex={0}
              style={{
                display: 'block',
                maxWidth: '100%',
                maxHeight: '100%',
                cursor: isStreaming ? 'none' : 'default',
              }}
              onMouseDown={handleMouseEvent}
              onMouseUp={handleMouseEvent}
              onMouseMove={handleMouseEvent}
              onWheel={handleMouseEvent}
            />

            {/* Overlay — waiting for first frame */}
            {!isStreaming && remoteSession && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80">
                <LoadingOutlined className="text-[#F6921E] text-4xl" spin />
                <p className="text-white font-bold text-sm">Waiting for screen data...</p>
                <p className="text-slate-400 text-xs">Make sure the PC agent is running</p>
              </div>
            )}

            {/* Overlay — no session yet but socket connected */}
            {!remoteSession && isConnected && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80">
                <LoadingOutlined className="text-[#F6921E] text-4xl" spin />
                <p className="text-white font-bold text-sm">Starting remote session...</p>
                <p className="text-slate-400 text-xs">{connectionStatus}</p>
              </div>
            )}

            {/* Overlay — not connected */}
            {!isConnected && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90">
                <DisconnectOutlined className="text-red-400 text-5xl" />
                <p className="text-white font-bold text-base">Not Connected</p>
                <p className="text-slate-400 text-sm">{connectionStatus}</p>
                {!deviceId && (
                  <p className="text-yellow-400 text-xs mt-1">No device selected</p>
                )}
              </div>
            )}

            {/* Live badge (top-right) */}
            {isStreaming && (
              <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 pointer-events-none">
                <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Live • {streamStats.fps} FPS
                </div>
                <div className="bg-[#F6921E]/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-[#F6921E]/40">
                  Frame #{streamStats.frameCount}
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom Taskbar ────────────────────────────────────── */}
          <footer className="h-16 bg-[#2B2B2B] border-t border-white/10 flex items-center px-4 justify-between shrink-0">

            {/* Left — Hubstaff + Latency */}
            <div className="flex items-center gap-4">
              <div className="bg-white/5 px-3 py-2 rounded-lg flex items-center gap-2 border border-white/10">
                <div className={`h-2 w-2 rounded-full ${hubstaffPaused ? 'bg-slate-500' : 'bg-[#F6921E]'}`} />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter">HUBSTAFF</span>
                <div className="h-4 w-px bg-slate-600" />
                <span className="text-sm font-bold tabular-nums text-white">{formatTime(hubstaffSecs)}</span>
                <button
                  onClick={handlePauseHubstaff}
                  className="bg-[#F6921E] text-white p-1 rounded hover:opacity-80 transition-opacity"
                >
                  <PauseOutlined className="text-xs" />
                </button>
              </div>
              <div className="h-8 w-px bg-[#F6921E]/10 mx-1" />
              {/* Stream stats */}
              {isStreaming && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Stream</span>
                  <span className="text-[10px] font-bold text-[#F6921E] uppercase">
                    {streamStats.fps} FPS · {Math.round(streamStats.avgFrameSize / 1024)}KB
                  </span>
                </div>
              )}
            </div>

            {/* Center — App Icons */}
            <div className="flex items-center gap-1.5">
              {[<FileTextOutlined />, <TableOutlined />, <CodeOutlined />, <ReloadOutlined />].map((icon, i) => (
                <button key={i} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                  <span className="text-base">{icon}</span>
                </button>
              ))}
            </div>

            {/* Right — Session Duration + Terminate */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase leading-none mb-1">
                  Session Duration
                </p>
                <p className="text-xs font-bold text-slate-300 tabular-nums">
                  {formatTime(sessionSecs)}
                </p>
              </div>
              <button
                onClick={handleTerminate}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500
                  px-4 py-2 rounded-lg text-xs font-bold transition-all border border-red-500/20"
              >
                <PoweroffOutlined className="text-sm" /> Terminate Session
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default UserHVNCSession;
