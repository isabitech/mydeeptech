import React, { useState, useEffect } from 'react';
import {
  PlusOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CaretRightOutlined,
  PauseOutlined,
  ReloadOutlined,
  CopyOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { message, Modal, Select } from 'antd';
import { useAdminHVNCDevices } from '../../../../hooks/HVNC/Admin/useAdminHVNCDevices';
import { useGetAllDtUsers } from '../../../../hooks/Auth/Admin/Annotators/useGetAllDtUsers';
import { HVNCDevice } from '../../../../hooks/HVNC/hvnc.types';

const { Option } = Select;

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: 'Active' | 'Offline' }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
      ${status === 'Active'
        ? 'bg-emerald-500/10 text-emerald-400'
        : 'bg-red-500/10 text-red-400'}`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
    {status}
  </span>
);

const HubstaffBar = ({ percent, time, active }: { percent: number; time: string; active: boolean }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 min-w-[60px] h-1.5 rounded-full bg-slate-700">
      <div
        className={`h-full rounded-full ${active ? 'bg-[#F6921E]' : 'bg-slate-600'}`}
        style={{ width: `${percent}%` }}
      />
    </div>
    <span className={`text-xs font-bold whitespace-nowrap font-mono ${active ? 'text-white' : 'text-slate-500'}`}>
      {time}
    </span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

type TabKey = 'all' | 'active' | 'inactive';

const AdminHVNCDevices: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignPcName, setAssignPcName] = useState('');
  const [assignUserSearch, setAssignUserSearch] = useState('');

  const {
    loading,
    devices,
    totalCount,
    selectedDevice,
    getAllDevices,
    getDeviceById,
    updateDevice,
    deleteDevice,
    generateAccessCode,
    startHubstaff,
    pauseHubstaff,
    setSelectedDevice,
  } = useAdminHVNCDevices();

  const {
    getAllDTUsers,
    loading: dtUsersLoading,
    users: dtUsers,
  } = useGetAllDtUsers();

  useEffect(() => {
    getAllDevices().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setSelectedDevice(res.data[0]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    const statusMap: Record<TabKey, 'Active' | 'Offline' | undefined> = {
      all: undefined,
      active: 'Active',
      inactive: 'Offline',
    };
    getAllDevices(statusMap[tab]);
  };

  const handleRowClick = (device: HVNCDevice) => {
    setSelectedDevice(device);
    getDeviceById(device.id);
  };

  const handleCopy = () => {
    if (!selectedDevice?.accessCode) return;
    navigator.clipboard.writeText(selectedDevice.accessCode);
    message.success('Access code copied!');
  };

  const handleGenerateCode = async () => {
    if (!selectedDevice) return;
    const res = await generateAccessCode(selectedDevice.id);
    if (res.success) {
      message.success('New access code generated!');
    } else {
      message.error(res.error ?? 'Failed to generate code');
    }
  };

  const handleStartHubstaff = async () => {
    if (!selectedDevice) return;
    const res = await startHubstaff(selectedDevice.id);
    if (res.success) {
      message.success('Hubstaff timer started');
    } else {
      message.error(res.error ?? 'Failed to start timer');
    }
  };

  const handlePauseHubstaff = async () => {
    if (!selectedDevice) return;
    const res = await pauseHubstaff(selectedDevice.id);
    if (res.success) {
      message.success('Hubstaff timer paused');
    } else {
      message.error(res.error ?? 'Failed to pause timer');
    }
  };

  const handleOpenAssign = () => {
    if (!selectedDevice) return;
    setAssignPcName(selectedDevice.pcName);
    setAssignUserId('');
    setAssignUserSearch('');
    getAllDTUsers({ status: 'approved', limit: 1000 });
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedDevice || !assignUserId) {
      message.warning('Please select a user to assign.');
      return;
    }
    const payload = { assignedUserId: assignUserId, pcName: assignPcName || selectedDevice.pcName };
    const res = await updateDevice(selectedDevice.id, payload);
    if (res.success) {
      message.success('User assigned successfully');
      setAssignModalOpen(false);
    } else {
      message.error(res.error ?? 'Failed to assign user');
    }
  };

  const handleDelete = () => {
    if (!selectedDevice) return;
    Modal.confirm({
      title: `Remove ${selectedDevice.pcName}?`,
      content: 'This action cannot be undone.',
      okText: 'Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        const res = await deleteDevice(selectedDevice.id);
        if (res.success) {
          message.success('Device removed');
        } else {
          message.error(res.error ?? 'Failed to remove device');
        }
      },
    });
  };

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'all',      label: 'All Devices', count: totalCount.total },
    { key: 'active',   label: 'Active',      count: totalCount.activeCount },
    { key: 'inactive', label: 'Inactive',    count: totalCount.inactiveCount },
  ];

  const activityItems = selectedDevice?.activity ?? [];

  return (
    <div className="p-6 space-y-6 font-[gilroy-regular]">

      {/* Page Title */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-white text-2xl font-black tracking-tight">Device Management</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor and control your HVNC infrastructure</p>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold
            bg-[#333333] hover:bg-[#444444] transition-colors shadow-lg"
          onClick={() => message.info('Register Device coming soon')}
        >
          <PlusOutlined />
          Register Device
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-colors
              ${activeTab === tab.key
                ? 'border-[#F6921E] text-[#F6921E]'
                : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            {tab.label}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px]
                ${activeTab === tab.key ? 'bg-[#F6921E]/10 text-[#F6921E]' : 'bg-slate-700 text-slate-400'}`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* Left column — Table + Note */}
        <div className="xl:col-span-2 flex flex-col gap-5">

          {/* Device Table */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: '#2B2B2B', borderColor: '#3d3d3d' }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <LoadingOutlined className="text-[#F6921E] text-3xl" spin />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: '#353535', borderBottom: '1px solid #3d3d3d' }}>
                      {['#', 'PC Name', 'Status', 'Assigned', 'Hubstaff', 'Last Seen'].map((col) => (
                        <th
                          key={col}
                          className={`px-4 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider
                            ${col === '#' ? 'w-12 text-center' : ''}`}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((device) => {
                      const isSelected = selectedDevice?.id === device.id;
                      return (
                        <tr
                          key={device.id}
                          onClick={() => handleRowClick(device)}
                          className="cursor-pointer transition-colors"
                          style={{
                            borderBottom: '1px solid #3d3d3d',
                            backgroundColor: isSelected ? 'rgba(246,146,30,0.08)' : 'transparent',
                            borderLeft: isSelected ? '4px solid #F6921E' : '4px solid transparent',
                          }}
                        >
                          <td className="px-4 py-4 text-slate-400 text-sm font-medium text-center">{device.id}</td>
                          <td className="px-4 py-4 text-white text-sm font-bold">{device.pcName}</td>
                          <td className="px-4 py-4"><StatusBadge status={device.status} /></td>
                          <td className="px-4 py-4 text-slate-400 text-sm">{device.assigned}</td>
                          <td className="px-4 py-4 min-w-[160px]">
                            <HubstaffBar
                              percent={device.hubstaffPercent}
                              time={device.hubstaff}
                              active={device.status === 'Active'}
                            />
                          </td>
                          <td className="px-4 py-4 text-slate-400 text-sm italic">{device.lastSeen}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Infrastructure Note */}
          <div className="rounded-xl bg-[#F6921E]/10 border border-[#F6921E]/20 p-5 flex items-start gap-4">
            <InfoCircleOutlined className="text-[#F6921E] text-2xl mt-0.5 shrink-0" />
            <div>
              <h4 className="text-white font-bold text-base mb-1">HVNC Infrastructure Note</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                All devices listed above are currently connected via the secure B2 tunnel protocol.
                Ensure that the local agent version matches the gateway version (v4.2.0) to maintain
                low-latency session performance.
              </p>
            </div>
          </div>
        </div>

        {/* Right column — Device Details */}
        {selectedDevice && (
          <div
            className="rounded-xl border p-6 flex flex-col gap-6"
            style={{ backgroundColor: '#2B2B2B', borderColor: '#3d3d3d' }}
          >
            {/* Detail Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-bold">Device Details</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleOpenAssign}
                  className="p-2 rounded-lg bg-slate-700 text-slate-400 hover:text-[#F6921E] transition-colors"
                  title="Assign User"
                >
                  <EditOutlined />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg bg-slate-700 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <DeleteOutlined />
                </button>
              </div>
            </div>

            {/* Detail Rows */}
            <div className="flex flex-col gap-1">
              {[
                {
                  label: 'PC Name',
                  value: <span className="text-white text-sm font-bold">{selectedDevice.pcName}</span>,
                },
                {
                  label: 'Status',
                  value: (
                    <span
                      className={`flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider
                        ${selectedDevice.status === 'Active' ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${selectedDevice.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {selectedDevice.status}
                    </span>
                  ),
                },
                {
                  label: 'Assignment',
                  value: (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#F6921E]/20 flex items-center justify-center text-[#F6921E] text-xs font-bold">
                        {selectedDevice.assigned.charAt(0)}
                      </div>
                      <span className="text-white text-sm font-medium">{selectedDevice.assigned}</span>
                    </div>
                  ),
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-slate-400 text-sm">{label}</span>
                  {value}
                </div>
              ))}
            </div>

            {/* Hubstaff Control */}
            <div className="rounded-lg p-4 flex flex-col gap-3" style={{ backgroundColor: '#353535' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <ClockCircleOutlined className="text-sm" />
                  <span className="text-xs font-bold uppercase tracking-widest">Hubstaff Control</span>
                </div>
                <span className="text-[#F6921E] text-lg font-black font-mono">{selectedDevice.hubstaff}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleStartHubstaff}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-white text-xs
                    font-bold bg-[#333333] hover:bg-[#444444] transition-colors disabled:opacity-50"
                >
                  <CaretRightOutlined /> Start
                </button>
                <button
                  onClick={handlePauseHubstaff}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-slate-300
                    text-xs font-bold bg-slate-700 hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  <PauseOutlined /> Pause
                </button>
              </div>
            </div>

            {/* Access Code */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Access Code</span>
                <button
                  onClick={handleGenerateCode}
                  disabled={loading}
                  className="text-[#F6921E] text-xs font-bold hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <ReloadOutlined className="text-xs" /> Generate New
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 rounded-lg px-4 py-3 font-mono text-[#F6921E] font-bold tracking-[0.2em]
                    border text-sm"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#3d3d3d' }}
                >
                  {selectedDevice.accessCode ?? '—'}
                </div>
                <button
                  onClick={handleCopy}
                  className="w-11 h-11 flex items-center justify-center rounded-lg border text-slate-400
                    hover:text-[#F6921E] transition-colors"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#3d3d3d' }}
                >
                  <CopyOutlined />
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="flex flex-col gap-4">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Recent Activity</span>
              <div className="flex flex-col gap-4">
                {activityItems.length > 0 ? (
                  activityItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${item.active ? 'bg-[#F6921E]' : 'bg-slate-600'}`} />
                        {idx < activityItems.length - 1 && (
                          <div className="w-px flex-1 bg-slate-700 mt-2" />
                        )}
                      </div>
                      <div className="pb-1">
                        <p className="text-white text-xs font-bold">{item.label}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">{item.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs">No activity recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Assign User Modal ──────────────────────────────────────── */}
      <Modal
        open={assignModalOpen}
        onCancel={() => setAssignModalOpen(false)}
        onOk={handleAssignSubmit}
        okText="Assign"
        confirmLoading={loading}
        title={
          <span className="text-white font-bold">
            Assign User — <span className="text-[#F6921E]">{selectedDevice?.pcName}</span>
          </span>
        }
        styles={{
          content: { backgroundColor: '#2B2B2B', border: '1px solid #3d3d3d' },
          header: { backgroundColor: '#2B2B2B', borderBottom: '1px solid #3d3d3d' },
          footer: { backgroundColor: '#2B2B2B', borderTop: '1px solid #3d3d3d' },
          mask: { backdropFilter: 'blur(4px)' },
        }}
        okButtonProps={{
          style: { backgroundColor: '#F6921E', borderColor: '#F6921E', color: '#333333', fontWeight: 700 },
        }}
        cancelButtonProps={{
          style: { backgroundColor: '#333333', borderColor: '#555', color: '#ccc' },
        }}
      >
        <div className="flex flex-col gap-5 py-4">
          {/* User Select */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Select User</label>
            <Select
              value={assignUserId || undefined}
              onChange={(val) => setAssignUserId(val)}
              onSearch={(val) => setAssignUserSearch(val)}
              placeholder="Search and select a user..."
              showSearch
              allowClear
              loading={dtUsersLoading}
              filterOption={false}
              style={{ width: '100%' }}
              className="[&_.ant-select-selector]:!bg-[#333333] [&_.ant-select-selector]:!border-slate-600 [&_.ant-select-selector]:!text-white [&_.ant-select-selection-placeholder]:!text-slate-500 [&_.ant-select-arrow]:!text-slate-400 [&_.ant-select-selection-search-input]:!text-white [&.ant-select-focused_.ant-select-selector]:!border-[#F6921E]"
              notFoundContent={dtUsersLoading ? 'Loading...' : 'No users found'}
              dropdownStyle={{ backgroundColor: '#333333', border: '1px solid #475569' }}
            >
              {dtUsers
                .filter((u) =>
                  u.fullName.toLowerCase().includes(assignUserSearch.toLowerCase()) ||
                  u.email.toLowerCase().includes(assignUserSearch.toLowerCase())
                )
                .map((u) => (
                  <Option key={u._id} value={u._id} title={`${u.fullName} (${u.email})`}>
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{u.fullName}</span>
                      <span className="text-xs text-slate-400">{u.email}</span>
                    </div>
                  </Option>
                ))}
            </Select>
          </div>

          {/* PC Name (optional rename) */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
              PC Name <span className="normal-case text-slate-600">(optional rename)</span>
            </label>
            <input
              type="text"
              value={assignPcName}
              onChange={(e) => setAssignPcName(e.target.value)}
              placeholder={selectedDevice?.pcName}
              className="w-full bg-[#333333] border border-slate-600 rounded-lg text-sm text-white
                placeholder:text-slate-600 focus:border-[#F6921E] py-2 px-3 outline-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminHVNCDevices;
