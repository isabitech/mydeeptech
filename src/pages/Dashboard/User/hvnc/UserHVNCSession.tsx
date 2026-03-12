import React, { useEffect, useState } from 'react';
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
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
  LockOutlined,
  StarOutlined,
  StarFilled,
  ShareAltOutlined,
  MoreOutlined,
  MailOutlined,
  InboxOutlined,
  SendOutlined,
  ClockCircleOutlined,
  EditOutlined,
  PoweroffOutlined,
  PauseOutlined,
  CodeOutlined,
  AppstoreOutlined,
  TableOutlined,
  MenuOutlined,
  UserOutlined,
  ExportOutlined,
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
}

interface Email {
  id: number;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  starred: boolean;
  unread: boolean;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const emails: Email[] = [
  {
    id: 1,
    sender: 'Google Security',
    subject: 'Security alert',
    preview: 'New login detected from Connected Desktop Chrome session.',
    time: '14:32',
    starred: false,
    unread: true,
  },
  {
    id: 2,
    sender: 'Hubstaff Support',
    subject: 'Weekly Digest',
    preview: 'Your productivity report for last week is ready for review...',
    time: '12:05',
    starred: false,
    unread: true,
  },
  {
    id: 3,
    sender: 'Project Manager',
    subject: 'Task #4521',
    preview: 'Hey, can you check the latest designs on the Connected Desktop project?',
    time: 'Yesterday',
    starred: true,
    unread: false,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (totalSeconds: number): string => {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const UserHVNCSession: React.FC<Props> = ({
  onDisconnect,
  sessionId,
  initialHubstaffSecs = 2 * 3600 + 15 * 60 + 48,
  initialSessionSecs  = 1 * 3600 + 45 * 60 + 12,
  onTerminate,
  onPauseHubstaff,
}) => {
  const [hubstaffSecs, setHubstaffSecs] = useState(initialHubstaffSecs);
  const [sessionSecs, setSessionSecs] = useState(initialSessionSecs);
  const [activeNav, setActiveNav] = useState('Sessions');
  const [url] = useState('https://mail.google.com/mail/u/0/#inbox');
  const [hubstaffPaused, setHubstaffPaused] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!hubstaffPaused) setHubstaffSecs((s) => s + 1);
      setSessionSecs((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [hubstaffPaused]);

  const handlePauseHubstaff = async () => {
    if (sessionId && onPauseHubstaff) {
      await onPauseHubstaff(sessionId);
    }
    setHubstaffPaused((prev) => !prev);
  };

  const handleTerminate = async () => {
    if (sessionId && onTerminate) {
      await onTerminate(sessionId);
    }
    onDisconnect();
  };

  return (
    <div
      className="flex flex-col h-full font-[gilroy-regular] text-slate-100"
      style={{ background: 'linear-gradient(135deg, #f48a1f, #d97706)' }}
    >
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
          <div className="relative hidden sm:block w-56">
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
                  <span className="text-sm font-bold leading-tight">Gmail - Hidden</span>
                  <span className="text-[10px] opacity-70 uppercase tracking-tighter">Running on Chrome</span>
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

            {/* Hubstaff Timer Card */}
            <div className="pt-4 border-t border-[#F6921E]/10">
              <div className="bg-[#F6921E]/10 border border-[#F6921E]/20 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                    Hubstaff Running
                  </span>
                </div>
                <div className="text-2xl font-bold text-emerald-400 tabular-nums">
                  {formatTime(hubstaffSecs)}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                  Today's total: 6h 30m
                </p>
              </div>
            </div>
          </div>

          {/* New Session button */}
          <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#333333] py-3 px-4 text-white text-sm font-bold hover:bg-[#444444] transition-all border border-white/10">
            <PlusOutlined /> New Session
          </button>
        </aside>

        {/* ── Main Workspace ───────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Browser Controls Bar */}
          <div className="flex items-center gap-3 px-4 py-2 bg-[#2B2B2B] border-b border-white/10 shrink-0">
            <div className="flex gap-1">
              {[<ArrowLeftOutlined />, <ArrowRightOutlined />, <ReloadOutlined />].map((icon, i) => (
                <button key={i} className="p-1.5 rounded-md hover:bg-slate-700 text-slate-500 transition-colors">
                  <span className="text-sm">{icon}</span>
                </button>
              ))}
            </div>
            <div className="flex-1 flex items-center bg-white/10 rounded-full px-4 py-1.5 border border-transparent focus-within:border-[#F6921E]/40">
              <LockOutlined className="text-emerald-500 text-sm mr-2 shrink-0" />
              <input
                readOnly
                className="bg-transparent border-none focus:ring-0 text-xs w-full text-slate-300 font-medium outline-none"
                value={url}
              />
              <StarOutlined className="text-slate-400 cursor-pointer hover:text-slate-200 text-sm shrink-0" />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#333333] text-white text-xs font-bold hover:bg-[#444444] transition-colors">
                <ShareAltOutlined className="text-sm" /> Share
              </button>
              <button className="p-1.5 rounded-md hover:bg-slate-700 text-slate-500 transition-colors">
                <MoreOutlined className="text-sm" />
              </button>
            </div>
          </div>

          {/* ── Virtual Desktop Content (Gmail Mockup) ──────────────── */}
          <div className="flex-1 relative bg-[#f1f3f4] overflow-hidden flex flex-col">
            <div className="flex-1 flex flex-col text-slate-900">

              {/* Gmail Header */}
              <div className="h-12 bg-white flex items-center px-4 justify-between border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-3">
                  <MenuOutlined className="text-slate-500" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 bg-red-500 rounded-sm flex items-center justify-center">
                      <MailOutlined className="text-white text-xs" />
                    </div>
                    <span className="text-base font-medium text-slate-600">Gmail</span>
                  </div>
                </div>
                <div className="max-w-xl flex-1 px-8">
                  <div className="bg-slate-100 rounded-lg flex items-center px-3 py-1.5">
                    <SearchOutlined className="text-slate-500 mr-2" />
                    <input
                      className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none"
                      placeholder="Search mail"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AppstoreOutlined className="text-slate-500 text-lg" />
                </div>
              </div>

              {/* Gmail Body */}
              <div className="flex flex-1 overflow-hidden">
                {/* Gmail Sidebar */}
                <div className="w-56 bg-white border-r border-slate-200 p-2 flex flex-col gap-1 shrink-0">
                  <button className="bg-blue-100 text-blue-800 rounded-2xl py-3 px-5 mb-3 flex items-center gap-3 font-semibold shadow-sm text-sm">
                    <EditOutlined /> Compose
                  </button>
                  <div className="flex items-center justify-between px-3 py-1.5 bg-red-100 text-red-800 rounded-r-full font-bold text-sm">
                    <div className="flex items-center gap-3">
                      <InboxOutlined className="text-sm" /> Inbox
                    </div>
                    <span className="text-xs">1,204</span>
                  </div>
                  {[
                    { icon: <StarOutlined />, label: 'Starred' },
                    { icon: <ClockCircleOutlined />, label: 'Snoozed' },
                    { icon: <SendOutlined />, label: 'Sent' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 px-3 py-1.5 text-slate-600 text-sm cursor-pointer hover:bg-slate-50 rounded-r-full">
                      {item.icon} {item.label}
                    </div>
                  ))}
                </div>

                {/* Email List */}
                <div className="flex-1 bg-white overflow-y-auto">
                  <div className="divide-y divide-slate-100">
                    {emails.map((email) => (
                      <div
                        key={email.id}
                        className="flex items-center gap-4 px-4 py-3 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <span className="text-slate-300 text-sm shrink-0">☐</span>
                        {email.starred
                          ? <StarFilled className="text-yellow-500 text-sm shrink-0" />
                          : <StarOutlined className="text-slate-300 text-sm shrink-0" />}
                        <span className={`w-36 text-sm truncate shrink-0 ${email.unread ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                          {email.sender}
                        </span>
                        <span className="flex-1 text-sm text-slate-700 truncate">
                          <span className={`${email.unread ? 'font-bold' : ''}`}>{email.subject}</span>
                          {' - '}{email.preview}
                        </span>
                        <span className="text-xs text-slate-500 font-medium shrink-0">{email.time}</span>
                      </div>
                    ))}
                    {/* Empty filler */}
                    <div className="flex flex-col items-center justify-center py-16 opacity-10 select-none">
                      <InboxOutlined style={{ fontSize: 72 }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlay Labels */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-2 pointer-events-none">
              <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/20">
                Encrypted Connection
              </div>
              <div className="bg-[#F6921E]/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-[#F6921E]/40">
                Chrome Session #001
              </div>
            </div>
          </div>

          {/* ── Bottom Taskbar ────────────────────────────────────── */}
          <footer className="h-16 bg-[#2B2B2B] border-t border-white/10 flex items-center px-4 justify-between shrink-0">

            {/* Left — Hubstaff + Latency */}
            <div className="flex items-center gap-4">
              <div className="bg-white/5 px-3 py-2 rounded-lg flex items-center gap-2 border border-white/10">
                <div className="h-2 w-2 rounded-full bg-[#F6921E]" />
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
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Latency</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-2 w-2 rounded-full bg-[#F6921E]" />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-[#F6921E] uppercase">24ms</span>
              </div>
            </div>

            {/* Center — App Icons */}
            <div className="flex items-center gap-1.5">
              <button className="p-2 rounded-lg bg-[#F6921E]/20 border border-[#F6921E]/40 text-[#F6921E] hover:bg-[#F6921E]/30 transition-colors">
                <MailOutlined className="text-base" />
              </button>
              {[<FileTextOutlined />, <TableOutlined />, <CodeOutlined />].map((icon, i) => (
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
