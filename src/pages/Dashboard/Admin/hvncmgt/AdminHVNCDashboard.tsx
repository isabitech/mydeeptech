import React, { useState, useEffect } from 'react';
import AdminHVNCDevices from './AdminHVNCDevices';
import AdminHVNCSchedules from './AdminHVNCSchedules';
import AdminHVNCUsers from './AdminHVNCUsers';
import { useAdminHVNCDashboard } from '../../../../hooks/HVNC/Admin/useAdminHVNCDashboard';
import { HVNCActivityItem, HVNCLiveDevice } from '../../../../hooks/HVNC/hvnc.types';
import {
  DashboardOutlined,
  DesktopOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  SearchOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  ThunderboltOutlined,
  LineChartOutlined,
  BarChartOutlined,
  LoginOutlined,
  LogoutOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  MoreOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  LoadingOutlined,
} from '@ant-design/icons';

// ─── Activity icon map ────────────────────────────────────────────────────────

const activityIconMap: Record<
  HVNCActivityItem['type'],
  { icon: React.ReactNode; iconBg: string; iconColor: string }
> = {
  login:     { icon: <LoginOutlined />,       iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-500' },
  session:   { icon: <SyncOutlined />,        iconBg: 'bg-[#F6921E]/20',  iconColor: 'text-[#F6921E]'  },
  warning:   { icon: <WarningOutlined />,     iconBg: 'bg-amber-500/20',  iconColor: 'text-amber-500'  },
  completed: { icon: <CheckCircleOutlined />, iconBg: 'bg-purple-500/20', iconColor: 'text-purple-500' },
  logout:    { icon: <LogoutOutlined />,      iconBg: 'bg-red-500/20',    iconColor: 'text-red-500'    },
};

// ─── Nav ──────────────────────────────────────────────────────────────────────

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
  { key: 'schedules', label: 'Schedules', icon: <CalendarOutlined /> },
  { key: 'devices',   label: 'Devices',   icon: <DesktopOutlined /> },
  { key: 'users',     label: 'Users',     icon: <UserOutlined /> },
  { key: 'sessions',  label: 'Sessions',  icon: <SyncOutlined /> },
  { key: 'timers',    label: 'Timers',    icon: <ClockCircleOutlined /> },
  { key: 'logs',      label: 'Logs',      icon: <FileTextOutlined /> },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  loading?: boolean;
}) => (
  <div className="bg-[#2B2B2B] p-6 rounded-xl border border-white/5 flex flex-col gap-1">
    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
    <div className="flex items-center justify-between mt-1">
      {loading ? (
        <LoadingOutlined className="text-slate-400 text-2xl" spin />
      ) : (
        <span className="text-3xl font-bold text-white">{value}</span>
      )}
      <span className={`${iconBg} ${iconColor} p-2 rounded-lg text-lg`}>{icon}</span>
    </div>
  </div>
);

const DeviceCard = ({ device }: { device: HVNCLiveDevice }) => {
  const isOnline = device.status === 'online';
  return (
    <div
      className={`p-5 rounded-xl border border-white/5 bg-[#2B2B2B] shadow-lg transition-all
        ${isOnline ? 'hover:border-[#F6921E]/50 cursor-pointer' : 'opacity-60 grayscale'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${isOnline ? 'bg-emerald-500/20' : 'bg-slate-500/10'}`}>
          <DesktopOutlined className={`text-lg ${isOnline ? 'text-emerald-500' : 'text-slate-400'}`} />
        </div>
        <span
          className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase
            ${isOnline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'}`}
        >
          {device.status}
        </span>
      </div>
      <h3 className="font-bold text-sm text-white">{device.name}</h3>
      <p className="text-xs text-slate-400 mt-1">
        {isOnline ? `User: ${device.user ?? '—'}` : `Last seen ${device.lastSeen}`}
      </p>
      <div className="mt-4 flex items-center gap-2 text-xs font-mono text-slate-400">
        <ClockCircleOutlined className="text-sm" />
        {device.uptime ?? '--:--:--'}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminHVNCDashboard: React.FC = () => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const {
    loadingStats,
    loadingDevices,
    loadingActivity,
    stats,
    liveDevices,
    activity,
    loadDashboard,
  } = useAdminHVNCDashboard();

  useEffect(() => {
    if (activeNav === 'dashboard') {
      loadDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNav]);

  return (
    <div
      className="flex h-full rounded-xl overflow-hidden font-[gilroy-regular] text-slate-100"
      style={{ background: 'linear-gradient(135deg, #333333, #F6921E)', minHeight: '100%' }}
    >
      {/* ── Inner Sidebar ─────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 bg-[#2B2B2B] border-r border-white/10 flex flex-col">
        {/* Brand */}
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          <div className="bg-[#F6921E] p-2 rounded-lg">
            <SafetyCertificateOutlined className="text-white text-base" />
          </div>
          <h1 className="text-base font-bold tracking-tight text-white">HVNC Control</h1>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveNav(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeNav === item.key
                  ? 'bg-[#F6921E] text-[#333333]'
                  : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full bg-[#F6921E]/20 flex items-center justify-center">
              <UserOutlined className="text-[#F6921E] text-sm" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Admin User</span>
              <span className="text-[10px] text-slate-500">v2.4.0 Stable</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-y-auto min-w-0">

        {/* Header */}
        <header className="h-16 border-b border-white/10 bg-[#2B2B2B]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="relative w-80">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <input
              className="w-full bg-[#333333] border-none rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F6921E]/50"
              placeholder="Search devices, sessions, or logs..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
              <BellOutlined className="text-slate-300 text-base" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#2B2B2B]" />
            </button>
            <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
              <SettingOutlined className="text-slate-300 text-base" />
            </button>
            <div className="h-8 w-px bg-slate-700 mx-1" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F6921E] to-blue-400" />
          </div>
        </header>

        {/* Page Body */}
        {activeNav === 'devices' ? (
          <AdminHVNCDevices />
        ) : activeNav === 'schedules' ? (
          <AdminHVNCSchedules />
        ) : activeNav === 'users' ? (
          <AdminHVNCUsers />
        ) : (
        <div className="p-6 space-y-6 flex-1">

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Devices"
              value={stats?.totalDevices ?? 0}
              icon={<DesktopOutlined />}
              iconBg="bg-[#F6921E]/10"
              iconColor="text-[#F6921E]"
              loading={loadingStats}
            />
            <StatCard
              label="Online"
              value={stats?.onlineDevices ?? 0}
              icon={<ThunderboltOutlined />}
              iconBg="bg-emerald-500/10"
              iconColor="text-emerald-500"
              loading={loadingStats}
            />
            <StatCard
              label="Active Sessions"
              value={stats?.activeSessions ?? 0}
              icon={<LineChartOutlined />}
              iconBg="bg-amber-500/10"
              iconColor="text-amber-500"
              loading={loadingStats}
            />
            <StatCard
              label="Timers"
              value={stats?.activeTimers ?? 0}
              icon={<ClockCircleOutlined />}
              iconBg="bg-purple-500/10"
              iconColor="text-purple-500"
              loading={loadingStats}
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-6">

            {/* Live Devices */}
            <div className="col-span-12 lg:col-span-9 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Live Devices</h2>
                <button
                  onClick={() => setActiveNav('devices')}
                  className="text-sm text-[#F6921E] font-semibold hover:underline"
                >
                  View All
                </button>
              </div>
              {loadingDevices ? (
                <div className="flex items-center justify-center h-40">
                  <LoadingOutlined className="text-[#F6921E] text-3xl" spin />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {liveDevices.map((device) => (
                    <DeviceCard key={device.id} device={device} />
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="col-span-12 lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Recent Activity</h2>
                <button className="p-1 hover:bg-slate-800 rounded-lg">
                  <MoreOutlined className="text-slate-400 text-base" />
                </button>
              </div>
              <div className="bg-[#2B2B2B] border border-white/5 rounded-xl overflow-hidden">
                <div className="p-4 space-y-5">
                  {loadingActivity ? (
                    <div className="flex items-center justify-center py-6">
                      <LoadingOutlined className="text-[#F6921E] text-2xl" spin />
                    </div>
                  ) : activity.length > 0 ? (
                    activity.map((item) => {
                      const iconConfig = activityIconMap[item.type] ?? activityIconMap.warning;
                      return (
                        <div key={item.id} className="flex gap-3">
                          <div className={`w-9 h-9 shrink-0 rounded-full ${iconConfig.iconBg} flex items-center justify-center ${iconConfig.iconColor} text-base`}>
                            {iconConfig.icon}
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="text-xs">
                              <span className="font-bold">{item.subject}</span> {item.message}
                            </p>
                            <span className="text-[10px] text-slate-500 uppercase font-medium tracking-tight">
                              {item.time}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-slate-500 text-xs text-center py-4">No recent activity</p>
                  )}
                </div>
                <button className="w-full py-3 bg-slate-800/60 border-t border-white/5 text-xs font-bold text-slate-500 uppercase hover:text-[#F6921E] transition-colors">
                  View Full Activity Log
                </button>
              </div>
            </div>
          </div>

          {/* Network Performance Overview */}
          <div className="bg-[#2B2B2B] p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center min-h-[260px] gap-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-[#F6921E]/10 flex items-center justify-center mb-2">
              <BarChartOutlined className="text-[#F6921E] text-3xl" />
            </div>
            <h3 className="text-lg font-bold text-white">Network Performance Overview</h3>
            <p className="text-slate-400 text-center max-w-md text-sm">
              Detailed traffic analysis and session latency reports are being calculated.
              Real-time data visualization will appear here in the next update.
            </p>
            <div className="flex gap-3 mt-2">
              <div className="w-2 h-2 rounded-full bg-[#F6921E] animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-[#F6921E]/60 animate-pulse delay-75" />
              <div className="w-2 h-2 rounded-full bg-[#F6921E]/30 animate-pulse delay-150" />
            </div>
          </div>

        </div>
        )}
      </main>
    </div>
  );
};

export default AdminHVNCDashboard;
