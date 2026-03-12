import React, { useState, useEffect } from 'react';
import {
  UserAddOutlined,
  UserOutlined,
  DesktopOutlined,
  FileTextOutlined,
  DisconnectOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CodeOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { message, Modal } from 'antd';
import { useAdminHVNCUsers } from '../../../../hooks/HVNC/Admin/useAdminHVNCUsers';
import { HVNCUser } from '../../../../hooks/HVNC/hvnc.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  deviceCount: number;
  status: 'Active' | 'Inactive';
  lastActive: string;
  phone: string;
  dateAdded: string;
  stats: { totalHours: string; thisWeek: string; today: string; avgDaily: string };
  assignedDevices: AssignedDevice[];
}

interface AssignedDevice {
  name: string;
  shift: string;
  lastUsed: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const users: UserRecord[] = [
  {
    id: 1, name: 'John Doe',     email: 'john.doe@hvnc.io',  role: 'Senior Systems Admin',
    deviceCount: 1, status: 'Active',   lastActive: '2 mins ago',
    phone: '+1 (555) 0123-4567', dateAdded: 'Jan 15, 2023',
    stats: { totalHours: '127h', thisWeek: '24h', today: '5h 15m', avgDaily: '4.2h' },
    assignedDevices: [
      { name: 'WORK-PC-01', shift: '9AM - 5PM', lastUsed: 'Today, 10:24 AM' },
    ],
  },
  {
    id: 2, name: 'Jane Smith',   email: 'jane.s@hvnc.io',    role: 'Operations Analyst',
    deviceCount: 0, status: 'Inactive', lastActive: '1 hour ago',
    phone: '+1 (555) 0234-5678', dateAdded: 'Mar 02, 2023',
    stats: { totalHours: '64h', thisWeek: '0h', today: '0h', avgDaily: '2.1h' },
    assignedDevices: [],
  },
  {
    id: 3, name: 'Robert Brown', email: 'r.brown@hvnc.io',   role: 'Network Engineer',
    deviceCount: 3, status: 'Active',   lastActive: '2 days ago',
    phone: '+1 (555) 0345-6789', dateAdded: 'Jun 10, 2022',
    stats: { totalHours: '310h', thisWeek: '38h', today: '7h 42m', avgDaily: '6.8h' },
    assignedDevices: [
      { name: 'DEV-STATION-04', shift: '8AM - 4PM',  lastUsed: 'Yesterday, 4:00 PM' },
      { name: 'OFFICE-LAPTOP',  shift: '12PM - 8PM', lastUsed: '2 days ago, 8:00 PM' },
      { name: 'REMOTE-SRV-02',  shift: '24/7',       lastUsed: 'Today, 06:00 AM' },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`rounded-xl border ${className}`}
    style={{
      background: 'rgba(43,43,43,0.85)',
      backdropFilter: 'blur(12px)',
      borderColor: 'rgba(255,255,255,0.1)',
    }}
  >
    {children}
  </div>
);

const InfoField = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="bg-white/5 p-3 rounded-lg">
    <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">{label}</p>
    <div className="text-slate-100 font-medium text-sm">{value}</div>
  </div>
);

const StatBox = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-[#333333] p-4 rounded-xl border border-white/5">
    <p className="text-slate-400 text-xs font-bold uppercase mb-1">{label}</p>
    <p className="text-2xl font-black text-[#F6921E] leading-none">{value}</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminHVNCUsers: React.FC = () => {
  const {
    loading,
    users,
    selectedUser,
    getAllUsers,
    getUserById,
    getUserLogs,
    unassignDevice,
    setSelectedUser,
  } = useAdminHVNCUsers();

  useEffect(() => {
    getAllUsers().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        getUserById(res.data[0].id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRowClick = (user: HVNCUser) => {
    setSelectedUser(user);
    getUserById(user.id);
  };

  const handleViewLogs = async (userId: number | string, deviceId?: string) => {
    const res = await getUserLogs(userId, deviceId);
    if (!res.success) message.error(res.error ?? 'Failed to load logs');
    else message.info(`${res.data?.length ?? 0} log entries loaded`);
  };

  const handleUnassign = (userId: number | string, deviceId?: string, deviceName?: string) => {
    if (!deviceId) { message.info('Unassign coming soon'); return; }
    Modal.confirm({
      title: `Unassign ${deviceName ?? 'device'}?`,
      content: 'The user will lose access to this device immediately.',
      okText: 'Unassign',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        const res = await unassignDevice(userId, deviceId);
        if (res.success) message.success('Device unassigned');
        else message.error(res.error ?? 'Failed to unassign');
      },
    });
  };

  // Derive timeline segments — use API data if present, else static fallback
  const timelineSegments = selectedUser?.usageTimeline?.segments ?? [
    { type: 'active' as const,  widthPercent: 40 },
    { type: 'idle'   as const,  widthPercent: 10 },
    { type: 'active' as const,  widthPercent: 20 },
    { type: 'offline' as const, widthPercent: 30 },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 font-[gilroy-regular]">

      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">User Management</h2>
          <p className="text-slate-300 text-sm mt-1">Oversee access permissions and monitor user activity.</p>
        </div>
        <button
          onClick={() => message.info('Add User coming soon')}
          className="flex items-center gap-2 bg-[#333333] text-white hover:bg-slate-800 px-5 py-2.5 rounded-lg
            font-bold text-sm border border-white/10 transition-all shadow-lg"
        >
          <UserAddOutlined />
          Add User
        </button>
      </div>

      {/* ── User Table ─────────────────────────────────────────────── */}
      <GlassCard className="overflow-hidden shadow-2xl">
        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <LoadingOutlined className="text-[#F6921E] text-3xl" spin />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#333333] text-slate-300 text-xs font-bold uppercase tracking-wider">
                  {['#', 'Name', 'Email', 'Assigned Devices', 'Status', 'Last Active', 'Actions'].map((h) => (
                    <th key={h} className={`px-6 py-4 ${h === 'Assigned Devices' ? 'text-center' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => {
                  const isSelected = selectedUser?.id === user.id;
                  return (
                    <tr
                      key={user.id}
                      onClick={() => handleRowClick(user)}
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                      style={isSelected ? { background: 'rgba(246,146,30,0.06)' } : {}}
                    >
                      <td className="px-6 py-4 text-slate-400 font-mono text-sm">
                        {String(user.id).padStart(2, '0')}
                      </td>
                      <td className="px-6 py-4 text-white font-bold text-sm">{user.name}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{user.email}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold
                            ${(user.deviceCount ?? 0) > 0
                              ? 'bg-[#F6921E]/20 text-[#F6921E]'
                              : 'bg-white/10 text-slate-300'}`}
                        >
                          {user.deviceCount ?? 0} {user.deviceCount === 1 ? 'Device' : 'Devices'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-slate-500'}`} />
                          <span className="text-sm text-slate-200">{user.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{user.lastActive}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRowClick(user); }}
                          className="text-[#F6921E] opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* ── Bottom Detail Section ───────────────────────────────────── */}
      {selectedUser && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column — Profile + Stats */}
          <div className="lg:col-span-1 space-y-5">

            {/* User Profile Detail */}
            <GlassCard className="p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F6921E]/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
              <h3 className="text-lg font-black text-white mb-5 flex items-center gap-2">
                <UserOutlined className="text-[#F6921E] text-lg" />
                User Profile Detail
              </h3>

              <div className="flex items-center gap-4 mb-5">
                <div className="h-16 w-16 rounded-full border-2 border-[#F6921E] p-0.5 shrink-0">
                  <div className="w-full h-full rounded-full bg-[#F6921E]/20 flex items-center justify-center">
                    <UserOutlined className="text-[#F6921E] text-2xl" />
                  </div>
                </div>
                <div>
                  <p className="text-xl font-bold text-white leading-tight">{selectedUser.name}</p>
                  <p className="text-[#F6921E] text-sm font-semibold">{selectedUser.role}</p>
                </div>
              </div>

              <div className="space-y-3">
                <InfoField label="Email"      value={selectedUser.email} />
                <InfoField label="Phone"      value={selectedUser.phone ?? '—'} />
                <InfoField label="Date Added" value={selectedUser.dateAdded ?? selectedUser.joinedDate ?? '—'} />
                <InfoField
                  label="Status"
                  value={
                    <span className={`font-bold flex items-center gap-1.5 ${selectedUser.status === 'Active' ? 'text-[#F6921E]' : 'text-slate-400'}`}>
                      <CheckCircleOutlined className="text-sm" />
                      {selectedUser.status}
                    </span>
                  }
                />
              </div>
            </GlassCard>

            {/* Usage Statistics */}
            <GlassCard className="p-6 shadow-xl">
              <h3 className="text-lg font-black text-white mb-5">Usage Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                <StatBox label="Total Hours" value={selectedUser.stats?.totalHours ?? '—'} />
                <StatBox label="This Week"   value={selectedUser.stats?.thisWeek ?? '—'} />
                <StatBox label="Today"       value={selectedUser.stats?.today ?? '—'} />
                <StatBox label="Avg Daily"   value={selectedUser.stats?.avgDaily ?? '—'} />
              </div>
            </GlassCard>
          </div>

          {/* Right column — Assigned Devices + Timeline */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6 shadow-xl h-full flex flex-col">

              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <CodeOutlined className="text-[#F6921E]" />
                  Assigned Devices
                </h3>
                <button
                  onClick={() => message.info('Assign Device coming soon')}
                  className="bg-[#F6921E] text-[#333333] px-4 py-2 rounded-lg font-bold text-sm
                    flex items-center gap-1 hover:brightness-110 transition-all"
                >
                  <PlusOutlined /> Assign New Device
                </button>
              </div>

              {/* Devices Table */}
              <div className="rounded-lg overflow-hidden border border-white/10 bg-[#333333]/50">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-xs font-bold uppercase border-b border-white/10">
                      <th className="px-4 py-3">Device Name</th>
                      <th className="px-4 py-3">Shift</th>
                      <th className="px-4 py-3">Last Used</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(selectedUser.assignedDevices ?? []).length > 0 ? (
                      (selectedUser.assignedDevices ?? []).map((device, idx) => (
                        <tr key={idx} className="group hover:bg-white/5 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <DesktopOutlined className="text-[#F6921E] text-base" />
                              <span className="text-white font-semibold text-sm">{device.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-300 text-sm">{device.shift}</td>
                          <td className="px-4 py-4 text-slate-400 text-sm">{device.lastUsed}</td>
                          <td className="px-4 py-4 text-right">
                            <span className="inline-flex items-center gap-3">
                              <button
                                onClick={() => handleViewLogs(selectedUser.id, device.id)}
                                className="text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-1"
                              >
                                <FileTextOutlined className="text-sm" /> View Logs
                              </button>
                              <button
                                onClick={() => handleUnassign(selectedUser.id, device.id, device.name)}
                                className="text-red-400 hover:text-red-300 transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-1"
                              >
                                <DisconnectOutlined className="text-sm" /> Unassign
                              </button>
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">
                          No devices assigned to this user.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="p-5 text-center bg-white/5 border-t border-white/5">
                  <p className="text-slate-500 text-xs">End of assigned devices list</p>
                </div>
              </div>

              {/* Device Usage Timeline */}
              <div className="mt-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Device Usage Timeline (Last 24h)
                </h4>
                <div className="h-14 w-full bg-[#333333] rounded-lg flex items-center px-4 border border-white/5">
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden flex">
                    {timelineSegments.map((seg, i) => (
                      <div
                        key={i}
                        className={`h-full ${seg.type === 'active' ? 'bg-[#F6921E]' : 'bg-slate-700'}`}
                        style={{ width: `${seg.widthPercent}%` }}
                        title={seg.type}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-bold">
                  <span>12:00 AM</span>
                  <span>06:00 AM</span>
                  <span>12:00 PM</span>
                  <span>06:00 PM</span>
                  <span>11:59 PM</span>
                </div>
              </div>

            </GlassCard>
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        className="rounded-xl border border-white/10 py-5 px-6 flex flex-col md:flex-row justify-between
          items-center gap-4"
        style={{ background: 'rgba(43,43,43,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <CheckCircleOutlined className="text-base" />
          Secure HVNC Environment — v4.2.1-stable
        </div>
        <div className="flex items-center gap-6">
          {['Support', 'Security Policy', 'API Docs'].map((link) => (
            <button key={link} className="text-xs font-bold text-slate-400 hover:text-[#F6921E] uppercase tracking-widest transition-colors">
              {link}
            </button>
          ))}
        </div>
        <p className="text-slate-500 text-xs">© 2024 HVNC Technologies Inc.</p>
      </div>

    </div>
  );
};

export default AdminHVNCUsers;
