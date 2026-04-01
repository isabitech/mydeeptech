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
  UsergroupAddOutlined,
  CalendarOutlined,
  TeamOutlined,
  HistoryOutlined,
  UserOutlined,
  CloudOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  PoweroffOutlined,
  DisconnectOutlined
} from '@ant-design/icons';
import { message, Modal, Select, Tabs } from 'antd';
import { useAdminHVNCDevices } from '../../../../hooks/HVNC/Admin/useAdminHVNCDevices';
import { useAdminHVNCMultiAssignment } from '../../../../hooks/HVNC/Admin/useAdminHVNCMultiAssignment';
import { useGetAllDtUsers } from '../../../../hooks/Auth/Admin/Annotators/useGetAllDtUsers';
import { HVNCDevice, HVNCBulkAssignmentResult, HVNCAssignmentFailure } from '../../../../hooks/HVNC/hvnc.types';
import MultiUserAssignment from '../../../../components/Admin/HVNC/MultiUserAssignment';
import DeviceScheduleCalendar from '../../../../components/Admin/HVNC/DeviceScheduleCalendar';
import ConflictResolutionModal from '../../../../components/Admin/HVNC/ConflictResolutionModal';
import DeviceUsersView from '../../../../components/Admin/HVNC/DeviceUsersView';

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
  const [multiAssignModalOpen, setMultiAssignModalOpen] = useState(false);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignPcName, setAssignPcName] = useState('');
  const [assignUserSearch, setAssignUserSearch] = useState('');
  const [rightPanelTab, setRightPanelTab] = useState('details');
  const [assignmentConflicts, setAssignmentConflicts] = useState<HVNCAssignmentFailure[]>([]);

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
    getDeviceUsers,
    assignMultipleUsers,
    getDeviceSchedule,
    loading: multiAssignLoading,
  } = useAdminHVNCMultiAssignment();

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

  const handleOpenMultiAssign = () => {
    if (!selectedDevice) return;
    setMultiAssignModalOpen(true);
  };

  const handleMultiAssignSuccess = (result: HVNCBulkAssignmentResult) => {
    if (result.totalSuccessful > 0) {
      message.success(`${result.totalSuccessful} users assigned successfully!`);
      // Refresh device data
      getAllDevices();
      if (selectedDevice) {
        getDeviceById(selectedDevice.id);
      }
    }
    
    if (result.totalFailed > 0) {
      setAssignmentConflicts(result.failedAssignments);
      setConflictModalOpen(true);
    }
    
    setMultiAssignModalOpen(false);
  };

  const handleMultiAssignError = (error: string) => {
    message.error(error);
    setMultiAssignModalOpen(false);
  };

  const handleConflictResolve = async (resolvedAssignments: any[]) => {
    if (!selectedDevice) return;
    
    try {
      const result = await assignMultipleUsers(selectedDevice.id.toString(), resolvedAssignments);
      if (result.success) {
        handleMultiAssignSuccess(result.data!);
      }
    } catch (error) {
      message.error('Failed to resolve conflicts');
    }
    setConflictModalOpen(false);
  };

  const handleConflictRetry = () => {
    // Could trigger a retry of the original assignments
    setConflictModalOpen(false);
    message.info('Retry functionality not implemented yet');
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

        {/* Right Panel */}
        <div className="w-[480px] flex-shrink-0 space-y-6">
          <Tabs
            activeKey={rightPanelTab}
            onChange={setRightPanelTab}
            className="hvnc-tabs"
            items={[
              {
                key: 'details',
                label: (
                  <span className="flex items-center gap-2">
                    <InfoCircleOutlined />
                    Device Details
                  </span>
                ),
                children: (
                  <div className="space-y-6">
                    {/* Device Info Card */}
                    <div
                      className="rounded-xl p-6 backdrop-blur-md border"
                      style={{
                        background: 'rgba(43,43,43,0.85)',
                        borderColor: 'rgba(255,255,255,0.1)',
                      }}
                    >
                      {selectedDevice ? (
                        <div className="space-y-6">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-white text-xl font-bold">{selectedDevice.pcName}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <StatusBadge status={selectedDevice.status} />
                                <span className="text-slate-400 text-sm">Device #{selectedDevice.id}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleOpenAssign}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
                              >
                                <EditOutlined className="text-sm" />
                                Assign Single
                              </button>
                              <button
                                onClick={handleOpenMultiAssign}
                                className="bg-[#F6921E] hover:bg-[#D47C16] text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
                              >
                                <UsergroupAddOutlined className="text-sm" />
                                Multi-Assign
                              </button>
                            </div>
                          </div>

                          {/* Device Stats */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#333333] p-4 rounded-xl">
                              <p className="text-slate-400 text-xs uppercase font-bold mb-2">Current User</p>
                              <div className="space-y-1">
                                <p className="text-white font-semibold">{selectedDevice.assigned || 'Unassigned'}</p>
                                {selectedDevice.assignedUserId && (
                                  <p className="text-slate-400 text-xs">ID: {selectedDevice.assignedUserId}</p>
                                )}
                              </div>
                            </div>
                            <div className="bg-[#333333] p-4 rounded-xl">
                              <p className="text-slate-400 text-xs uppercase font-bold mb-2">Last Seen</p>
                              <p className="text-white font-semibold">{selectedDevice.lastSeen || 'Unknown'}</p>
                            </div>
                          </div>

                          {/* Hubstaff Activity Details */}
                          <div className="bg-[#333333] p-4 rounded-xl">
                            <p className="text-slate-400 text-xs uppercase font-bold mb-3">Hubstaff Activity</p>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-300">Total Time</span>
                                <span className="text-white font-semibold">{selectedDevice.hubstaff || '00:00:00'}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-300">Seconds</span>
                                <span className="text-white font-semibold">{selectedDevice.hubstaffSeconds || 0}s</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-300">Percentage</span>
                                <span className="text-white font-semibold">{selectedDevice.hubstaffPercent || 0}%</span>
                              </div>
                              <HubstaffBar
                                percent={selectedDevice.hubstaffPercent}
                                time={selectedDevice.hubstaff}
                                active={selectedDevice.status === 'Active'}
                              />
                            </div>
                          </div>

                          {/* Access Code */}
                          <div className="bg-[#333333] p-4 rounded-xl">
                            <p className="text-slate-400 text-xs uppercase font-bold mb-2">Access Code</p>
                            <div className="flex items-center gap-3">
                              <code className="bg-black/30 px-3 py-2 rounded font-mono text-[#F6921E] text-lg font-bold flex-1">
                                {selectedDevice.accessCode || '••••••••'}
                              </code>
                              <button onClick={handleCopy} className="text-slate-400 hover:text-white p-2">
                                <CopyOutlined className="text-lg" />
                              </button>
                            </div>
                            <button
                              onClick={handleGenerateCode}
                              className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium"
                            >
                              Generate New Code
                            </button>
                          </div>

                          {/* Hubstaff Controls */}
                          <div className="flex gap-3">
                            <button
                              onClick={handleStartHubstaff}
                              className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                            >
                              <CaretRightOutlined />
                              Start Timer
                            </button>
                            <button
                              onClick={handlePauseHubstaff}
                              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                            >
                              <PauseOutlined />
                              Pause Timer
                            </button>
                          </div>

                          {/* Activity Log */}
                          {selectedDevice.activity && selectedDevice.activity.length > 0 && (
                            <div className="bg-[#333333] p-4 rounded-xl">
                              <div className="flex items-center gap-2 mb-3">
                                <HistoryOutlined className="text-blue-400" />
                                <p className="text-slate-400 text-xs uppercase font-bold">Recent Activity</p>
                              </div>
                              <div className="max-h-60 overflow-y-auto space-y-2">
                                {selectedDevice.activity.slice(0, 10).map((activity: any) => {
                                  const getActivityIcon = (event: string) => {
                                    switch (event.toLowerCase()) {
                                      case 'device online':
                                        return <CheckCircleOutlined className="text-green-400" />;
                                      case 'device disconnected':
                                        return <DisconnectOutlined className="text-red-400" />;
                                      case 'session ended':
                                        return <PoweroffOutlined className="text-orange-400" />;
                                      case 'device heartbeat':
                                        return <CloudOutlined className="text-blue-400" />;
                                      default:
                                        return <ExclamationCircleOutlined className="text-slate-400" />;
                                    }
                                  };

                                  return (
                                    <div 
                                      key={activity.id} 
                                      className={`flex items-center justify-between p-2 rounded text-sm ${
                                        activity.active 
                                          ? 'bg-blue-600/20 border border-blue-500/30' 
                                          : 'bg-black/20'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {getActivityIcon(activity.event)}
                                        <span className="text-white">{activity.event}</span>
                                        {activity.active && (
                                          <span className="text-xs bg-blue-500 px-1.5 py-0.5 rounded text-white font-medium">
                                            ACTIVE
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-slate-400 text-xs">{activity.time}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              {selectedDevice.activity.length > 10 && (
                                <div className="text-center mt-3">
                                  <span className="text-slate-400 text-xs">
                                    Showing 10 of {selectedDevice.activity.length} activities
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Danger Zone */}
                          <div className="pt-4 border-t border-white/10">
                            <button
                              onClick={handleDelete}
                              className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-400 py-2 rounded-lg text-sm font-semibold transition-colors"
                            >
                              <DeleteOutlined className="mr-1.5" />
                              Remove Device
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <InfoCircleOutlined className="text-slate-600 text-4xl mb-4" />
                          <p className="text-slate-400">Select a device to view details</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              },
              {
                key: 'schedule',
                label: (
                  <span className="flex items-center gap-2">
                    <CalendarOutlined />
                    Schedule
                  </span>
                ),
                children: selectedDevice ? (
                  <DeviceScheduleCalendar
                    deviceId={selectedDevice.id.toString()}
                    deviceName={selectedDevice.pcName}
                    onRefresh={() => {
                      getAllDevices();
                      if (selectedDevice) {
                        getDeviceById(selectedDevice.id);
                      }
                    }}
                  />
                ) : (
                  <div className="text-center py-12">
                    <CalendarOutlined className="text-slate-600 text-4xl mb-4" />
                    <p className="text-slate-400">Select a device to view schedule</p>
                  </div>
                )
              },
              {
                key: 'users',
                label: (
                  <span className="flex items-center gap-2">
                    <TeamOutlined />
                    Assigned Users
                  </span>
                ),
                children: selectedDevice ? (
                  <DeviceUsersView 
                    deviceId={selectedDevice.id} 
                    className="device-users-tab"
                  />
                ) : (
                  <div className="text-center py-12">
                    <TeamOutlined className="text-slate-600 text-4xl mb-4" />
                    <p className="text-slate-400">Select a device to view users</p>
                  </div>
                )
              }
            ]}
          />
        </div>
      </div>

      {/* Modals */}
      {/* Single User Assignment Modal */}
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

      {/* Multi-User Assignment Modal */}
      <MultiUserAssignment
        open={multiAssignModalOpen}
        onCancel={() => setMultiAssignModalOpen(false)}
        deviceId={selectedDevice?.id.toString() || ''}
        deviceName={selectedDevice?.pcName}
        onAssignmentSuccess={handleMultiAssignSuccess}
        onAssignmentError={handleMultiAssignError}
      />

      {/* Conflict Resolution Modal */}
      <ConflictResolutionModal
        open={conflictModalOpen}
        onCancel={() => setConflictModalOpen(false)}
        conflicts={assignmentConflicts}
        deviceName={selectedDevice?.pcName}
        onResolve={handleConflictResolve}
        onRetry={handleConflictRetry}
      />
    </div>
  );
};

export default AdminHVNCDevices;
