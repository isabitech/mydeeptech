import React, { useState, useEffect } from 'react';
import { PlusOutlined, DownloadOutlined, ReloadOutlined, CalendarOutlined } from '@ant-design/icons';
import { message, Select, Spin, Alert } from 'antd';
import { useAdminHVNCSchedules } from '../../../../hooks/HVNC/Admin/useAdminHVNCSchedules';
import { useAdminHVNCDevices } from '../../../../hooks/HVNC/Admin/useAdminHVNCDevices';
import { useAdminHVNCMultiAssignment } from '../../../../hooks/HVNC/Admin/useAdminHVNCMultiAssignment';
import { useGetAllDtUsers } from '../../../../hooks/Auth/Admin/Annotators/useGetAllDtUsers';
import { HVNCDeviceScheduleResponse, HVNCScheduleSlot } from '../../../../hooks/HVNC/hvnc.types';
import dayjs from 'dayjs';
import DeviceScheduleCalendar from '../../../../components/Admin/HVNC/DeviceScheduleCalendar';

const { Option } = Select;

// ─── Types ────────────────────────────────────────────────────────────────────

interface RealTimeShift {
  timeSlot: string;
  userName: string;
  userEmail: string;
  deviceName: string;
  deviceId: string;
  shiftId: string;
  status: string;
  isPrimary?: boolean;
}

interface RealTimeDayColumn {
  label: string;
  date: string;
  dayName: string;
  isToday?: boolean;
  isWeekend?: boolean;
  shifts: RealTimeShift[];
  availableSlots?: string[];
}

interface ScheduleOverviewData {
  totalShifts: number;
  activeDevices: number; 
  totalUsers: number;
  utilizationPercentage: number;
}

const timezones = [
  '(GMT-05:00) Eastern Time',
  '(GMT-08:00) Pacific Time',
  '(GMT+00:00) UTC',
  '(GMT+01:00) West Africa Time',
];

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DEFAULT_DAYS = [true, true, true, true, true, false, false];

// ─── Sub-components ───────────────────────────────────────────────────────────

const ShiftCard = ({ shift, isToday }: { shift: RealTimeShift; isToday?: boolean }) => (
  <div
    className={`p-4 rounded-xl border-l-4 transition-all
      ${shift.isPrimary !== false
        ? `border-l-[#F6921E] bg-[rgba(43,43,43,0.6)] backdrop-blur-sm border border-white/5 ${isToday ? 'ring-1 ring-[#F6921E]/20' : ''}`
        : 'border-l-slate-600 bg-[rgba(43,43,43,0.6)] backdrop-blur-sm border border-white/5 opacity-80'
      }`}
  >
    <p className={`text-[10px] font-bold uppercase mb-1 ${shift.isPrimary !== false ? 'text-[#F6921E]' : 'text-slate-400'}`}>
      {shift.timeSlot}
    </p>
    <p className="font-bold text-sm text-white">{shift.userName}</p>
    <p className="text-xs text-slate-400 mt-0.5">Device: {shift.deviceName}</p>
    <p className="text-xs text-slate-500 mt-0.5">{shift.userEmail}</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

type ViewMode = 'Month' | 'Week' | 'Day';

const AdminHVNCSchedules: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('Month');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [allSchedules, setAllSchedules] = useState<Record<string, HVNCDeviceScheduleResponse>>({});
  const [weekDays, setWeekDays] = useState<RealTimeDayColumn[]>([]);
  const [overviewData, setOverviewData] = useState<ScheduleOverviewData>({
    totalShifts: 0,
    activeDevices: 0,
    totalUsers: 0,
    utilizationPercentage: 0
  });
  const [recurringDays, setRecurringDays] = useState<boolean[]>(DEFAULT_DAYS);
  const [formUser, setFormUser] = useState('');
  const [formDevice, setFormDevice] = useState('');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState('');
  const [formStart, setFormStart] = useState('09:00');
  const [formEnd, setFormEnd] = useState('17:00');
  const [formTimezone, setFormTimezone] = useState(timezones[0]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [deviceSearchTerm, setDeviceSearchTerm] = useState('');

  const {
    loading,
    createShift,
  } = useAdminHVNCSchedules();

  const {
    getAllDevices,
    loading: devicesLoading,
    devices,
  } = useAdminHVNCDevices();

  const {
    getDeviceSchedule,
    loading: scheduleLoading,
  } = useAdminHVNCMultiAssignment();

  const {
    getAllDTUsers,
    loading: dtUsersLoading,
    users: dtUsers,
    resetState: resetDTUsersState
  } = useGetAllDtUsers();

  // Filter DTUsers based on search term
  const filteredDTUsers = dtUsers.filter(user => 
    user.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Filter devices based on search term
  const filteredDevices = devices.filter(device =>
    device.pcName.toLowerCase().includes(deviceSearchTerm.toLowerCase())
  );

  useEffect(() => {
    getAllDevices();
    loadDTUsers();
    loadAllSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek]);

  useEffect(() => {
    if (devices.length > 0) {
      loadAllSchedules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devices]);

  const loadDTUsers = async () => {
    try {
      await getAllDTUsers({ 
        status: 'approved', 
        limit: 1000 // Fetch up to 1000 users instead of default 10
      });
    } catch (error) {
      console.error('Failed to load DTUsers:', error);
    }
  };

  const loadAllSchedules = async () => {
    try {
      const schedulePromises = devices.map(async (device) => {
        const result = await getDeviceSchedule(device.id.toString(), currentWeek, true);
        return {
          deviceId: device.id.toString(),
          schedule: result.success ? result.data! : null,
        };
      });

      const scheduleResults = await Promise.all(schedulePromises);
      const newSchedules: Record<string, HVNCDeviceScheduleResponse> = {};
      
      scheduleResults.forEach(({ deviceId, schedule }) => {
        if (schedule) {
          newSchedules[deviceId] = schedule;
        }
      });

      setAllSchedules(newSchedules);
      generateWeekView(newSchedules);
      calculateOverviewData(newSchedules);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    }
  };

  const generateWeekView = (schedules: Record<string, HVNCDeviceScheduleResponse>) => {
    const baseDate = dayjs().add(currentWeek, 'week');
    const startOfWeek = baseDate.startOf('week');
    
    const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const newWeekDays: RealTimeDayColumn[] = DAYS_OF_WEEK.map((dayName, index) => {
      const currentDate = startOfWeek.add(index, 'day');
      const isToday = currentDate.isSame(dayjs(), 'day');
      const isWeekend = index >= 5; // Saturday, Sunday
      
      // Collect all shifts for this day from all devices
      const shifts: RealTimeShift[] = [];
      
      Object.values(schedules).forEach(schedule => {
        const daySchedule = schedule.schedule[dayName] || [];
        daySchedule.forEach(slot => {
          shifts.push({
            timeSlot: slot.timeSlot,
            userName: slot.userName,
            userEmail: slot.userEmail,
            deviceName: schedule.deviceName,
            deviceId: schedule.deviceId,
            shiftId: slot.shiftId,
            status: slot.status,
            isPrimary: slot.status === 'active'
          });
        });
      });

      // Sort shifts by time
      shifts.sort((a, b) => {
        const timeA = a.timeSlot.split('-')[0];
        const timeB = b.timeSlot.split('-')[0];
        return timeA.localeCompare(timeB);
      });

      return {
        label: dayName.slice(0, 3),
        date: currentDate.format('DD'),
        dayName,
        isToday,
        isWeekend,
        shifts,
      };
    });

    setWeekDays(newWeekDays);
  };

  const calculateOverviewData = (schedules: Record<string, HVNCDeviceScheduleResponse>) => {
    let totalShifts = 0;
    let totalUtilization = 0;
    const activeDevices = Object.keys(schedules).length;
    const uniqueUsers = new Set<string>();

    Object.values(schedules).forEach(schedule => {
      Object.values(schedule.schedule).forEach(daySchedule => {
        totalShifts += daySchedule.length;
        daySchedule.forEach(slot => {
          uniqueUsers.add(slot.userEmail);
        });
      });
      
      if (schedule.utilizationStats) {
        totalUtilization += schedule.utilizationStats.utilizationPercentage;
      }
    });

    setOverviewData({
      totalShifts,
      activeDevices,
      totalUsers: uniqueUsers.size,
      utilizationPercentage: activeDevices > 0 ? totalUtilization / activeDevices : 0
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => direction === 'next' ? prev + 1 : prev - 1);
  };

  const refreshSchedules = () => {
    loadAllSchedules();
  };

  const toggleDay = (idx: number) => {
    setRecurringDays((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUser || !formDevice) {
      message.warning('Please select a user and device.');
      return;
    }

    // Find IDs if API data available, else pass name/email as ID (backend handles lookup)
    const userObj = dtUsers.find((u) => u.fullName === formUser || u.email === formUser || u._id === formUser);
    const deviceObj = devices.find((d) => d.pcName === formDevice);

    // Use the user ID or fallback to the form value
    const userId = userObj?._id || userObj?.email || formUser;

    const daysOfWeek = recurringDays
      .map((active, idx) => (active ? idx + 1 : null))
      .filter((d): d is number => d !== null);

    const res = await createShift({
      userId: userId,
      deviceId: deviceObj ? String(deviceObj.id) : formDevice,
      startDate: new Date(formStartDate).toISOString(),
      ...(formEndDate && { endDate: new Date(formEndDate).toISOString() }),
      startTime: formStart,
      endTime: formEnd,
      timezone: formTimezone,
      isRecurring: true,
      daysOfWeek,
    });

    if (res.success) {
      const userName = userObj?.fullName || formUser;
      message.success(`Shift scheduled for ${userName} on ${formDevice}`);
      handleClear();
    } else {
      message.error(res.error ?? 'Failed to schedule shift');
    }
  };

  const handleClear = () => {
    setFormUser('');
    setFormDevice('');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate('');
    setFormStart('09:00');
    setFormEnd('17:00');
    setRecurringDays(DEFAULT_DAYS);
    setUserSearchTerm('');
    setDeviceSearchTerm('');
  };

  return (
    <div className="flex-1 overflow-y-auto font-[gilroy-regular]">

      {/* ── Top Header ─────────────────────────────────────────────── */}
      <header
        className="h-16 border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-10"
        style={{ background: 'rgba(43,43,43,0.6)', backdropFilter: 'blur(12px)' }}
      >
        <h1 className="text-base font-extrabold tracking-tight uppercase text-white">
          Shift Scheduling{' '}
          <span className="text-[#F6921E] ml-2">— {dayjs().add(currentWeek, 'week').format('MMMM YYYY')}</span>
        </h1>
        <div className="flex items-center gap-4">
          {/* Week Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              title="Previous Week"
            >
              ←
            </button>
            <span className="text-sm text-slate-300 min-w-[100px] text-center">
              {currentWeek === 0 ? 'This Week' : 
               currentWeek === -1 ? 'Last Week' : 
               currentWeek === 1 ? 'Next Week' : 
               `${currentWeek > 0 ? '+' : ''}${currentWeek} weeks`}
            </span>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              title="Next Week"
            >
              →
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex bg-slate-800/50 p-1 rounded-lg">
            {(['Month', 'Week', 'Day'] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-4 py-1.5 text-xs font-bold uppercase rounded-md transition-colors
                  ${viewMode === v
                    ? 'bg-[#F6921E] text-[#333333]'
                    : 'text-slate-400 hover:text-white'}`}
              >
                {v}
              </button>
            ))}
          </div>
          
          <button
            onClick={refreshSchedules}
            disabled={scheduleLoading}
            className="flex items-center gap-2 bg-[#333333] text-slate-100 px-4 py-2 rounded-lg text-sm
              font-bold border border-slate-700 hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            <ReloadOutlined className={scheduleLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          
          <button
            className="flex items-center gap-2 bg-[#333333] text-slate-100 px-4 py-2 rounded-lg text-sm
              font-bold border border-slate-700 hover:bg-slate-800 transition-all"
            onClick={() => message.info('Export coming soon')}
          >
            <DownloadOutlined />
            Export CSV
          </button>
        </div>
      </header>

      {/* ── Scrollable Body ─────────────────────────────────────────── */}
      <div className="p-6 space-y-6">

        {/* ── Overview Stats ──────────────────────────────────────── */}
        <section className="grid grid-cols-4 gap-4">
          <div className="bg-[#333333] p-4 rounded-xl border border-white/10">
            <p className="text-slate-400 text-xs uppercase font-bold mb-2">Total Shifts</p>
            <p className="text-2xl font-black text-[#F6921E] leading-none">{overviewData.totalShifts}</p>
          </div>
          <div className="bg-[#333333] p-4 rounded-xl border border-white/10">
            <p className="text-slate-400 text-xs uppercase font-bold mb-2">Active Devices</p>
            <p className="text-2xl font-black text-white leading-none">{overviewData.activeDevices}</p>
          </div>
          <div className="bg-[#333333] p-4 rounded-xl border border-white/10">
            <p className="text-slate-400 text-xs uppercase font-bold mb-2">Total Users</p>
            <p className="text-2xl font-black text-white leading-none">{overviewData.totalUsers}</p>
          </div>
          <div className="bg-[#333333] p-4 rounded-xl border border-white/10">
            <p className="text-slate-400 text-xs uppercase font-bold mb-2">Avg Utilization</p>
            <p className="text-2xl font-black text-green-400 leading-none">{overviewData.utilizationPercentage.toFixed(1)}%</p>
          </div>
        </section>

        {/* ── Weekly Calendar ──────────────────────────────────────── */}
        <section className="space-y-3">
          {scheduleLoading || devicesLoading ? (
            <div className="flex items-center justify-center h-64 bg-[#333333] rounded-xl">
              <div className="text-center">
                <Spin size="large" />
                <p className="text-slate-400 mt-4">Loading schedules...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-4">
                {weekDays.map((day) => (
                  <div
                    key={day.label + day.date}
                    className={`text-center text-xs font-black uppercase tracking-widest
                      ${day.isToday ? 'text-[#F6921E]' : day.isWeekend ? 'text-slate-700' : 'text-slate-500'}`}
                  >
                    {day.label} {day.date}
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              <div className="grid grid-cols-7 gap-4 min-h-[420px]">
                {weekDays.map((day) => (
                  <div
                    key={day.label + day.date + 'col'}
                    className={`space-y-3 ${day.isToday ? 'bg-white/5 rounded-2xl p-2 -mx-1' : ''}`}
                  >
                    {day.isWeekend ? (
                      /* Weekend placeholder */
                      <div className="border border-slate-800 p-4 rounded-xl bg-slate-800/20 opacity-60 h-full flex flex-col">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Off-Peak</p>
                        <p className="font-bold text-sm text-slate-500 italic text-center py-6">No Shifts Scheduled</p>
                      </div>
                    ) : day.shifts.length === 0 ? (
                      /* Empty day */
                      <div className="border border-dashed border-slate-600 p-4 rounded-xl h-full flex flex-col items-center justify-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Available</p>
                        <p className="font-bold text-sm text-slate-500 text-center">No Shifts</p>
                        <CalendarOutlined className="text-slate-600 text-lg mt-2" />
                      </div>
                    ) : (
                      <>
                        {day.shifts.map((shift, idx) => (
                          <ShiftCard key={idx} shift={shift} isToday={day.isToday} />
                        ))}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ── Create New Shift Form ─────────────────────────────────── */}
        <section
          className="p-8 rounded-2xl border"
          style={{
            background: 'rgba(43,43,43,0.6)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <PlusOutlined className="text-[#F6921E] text-lg" />
            <h3 className="text-base font-bold uppercase tracking-wide text-white">Create New Shift</h3>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Column 1 — User + Device */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Select DTUser</label>
                <Select
                  value={formUser}
                  onChange={(value) => setFormUser(value)}
                  onSearch={(value) => {
                    setUserSearchTerm(value);
                  }}
                  className="w-full [&_.ant-select-selector]:!bg-[#333333] [&_.ant-select-selector]:!border-slate-700 [&_.ant-select-selector]:!text-white [&_.ant-select-selection-placeholder]:!text-slate-500 [&_.ant-select-arrow]:!text-slate-400 [&_.ant-select-selection-search-input]:!text-white [&.ant-select-focused_.ant-select-selector]:!border-[#F6921E] [&.ant-select-focused_.ant-select-selector]:!ring-1 [&.ant-select-focused_.ant-select-selector]:!ring-[#F6921E]/50"
                  placeholder="Search and select a DTUser..."
                  showSearch
                  allowClear
                  loading={dtUsersLoading}
                  filterOption={false}
                  notFoundContent={dtUsersLoading ? 'Loading users...' : 'No users found'}
                  dropdownStyle={{
                    backgroundColor: '#333333',
                    border: '1px solid #475569',
                  }}
                  dropdownClassName="[&_.ant-select-item]:!bg-[#333333] [&_.ant-select-item]:!text-white [&_.ant-select-item-option-selected]:!bg-[#F6921E] [&_.ant-select-item-option-selected]:!text-[#333333] [&_.ant-select-item:hover]:!bg-slate-700"
                  style={{
                    width: '100%',
                  }}
                >
                  {filteredDTUsers.map((user) => (
                    <Option 
                      key={user._id} 
                      value={user._id}
                      title={`${user.fullName} (${user.email})`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{user.fullName}</span>
                        <span className="text-xs text-slate-400">{user.email}</span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Assign Device</label>
                <Select
                  value={formDevice}
                  onChange={(value) => setFormDevice(value)}
                  onSearch={(value) => {
                    setDeviceSearchTerm(value);
                  }}
                  className="w-full [&_.ant-select-selector]:!bg-[#333333] [&_.ant-select-selector]:!border-slate-700 [&_.ant-select-selector]:!text-white [&_.ant-select-selection-placeholder]:!text-slate-500 [&_.ant-select-arrow]:!text-slate-400 [&_.ant-select-selection-search-input]:!text-white [&.ant-select-focused_.ant-select-selector]:!border-[#F6921E] [&.ant-select-focused_.ant-select-selector]:!ring-1 [&.ant-select-focused_.ant-select-selector]:!ring-[#F6921E]/50"
                  placeholder="Search and select a device..."
                  showSearch
                  allowClear
                  loading={devicesLoading}
                  filterOption={false}
                  notFoundContent={devicesLoading ? 'Loading devices...' : 'No devices found'}
                  dropdownStyle={{
                    backgroundColor: '#333333',
                    border: '1px solid #475569',
                  }}
                  dropdownClassName="[&_.ant-select-item]:!bg-[#333333] [&_.ant-select-item]:!text-white [&_.ant-select-item-option-selected]:!bg-[#F6921E] [&_.ant-select-item-option-selected]:!text-[#333333] [&_.ant-select-item:hover]:!bg-slate-700"
                  style={{
                    width: '100%',
                  }}
                >
                  {filteredDevices.map((device) => (
                    <Option
                      key={device.id}
                      value={device.pcName}
                      title={device.pcName}
                    >
                      <div className="flex items-center">
                        <span className="font-medium">{device.pcName}</span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Column 2 — Dates + Times + Timezone */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    required
                    className="w-full bg-[#333333] border border-slate-700 rounded-lg text-sm text-white
                      focus:ring-[#F6921E] focus:border-[#F6921E] py-2 px-3 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">End Date <span className="normal-case text-slate-600">(optional)</span></label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    min={formStartDate}
                    className="w-full bg-[#333333] border border-slate-700 rounded-lg text-sm text-white
                      focus:ring-[#F6921E] focus:border-[#F6921E] py-2 px-3 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full bg-[#333333] border border-slate-700 rounded-lg text-sm text-white
                      focus:ring-[#F6921E] focus:border-[#F6921E] py-2 px-3 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">End Time</label>
                  <input
                    type="time"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full bg-[#333333] border border-slate-700 rounded-lg text-sm text-white
                      focus:ring-[#F6921E] focus:border-[#F6921E] py-2 px-3 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Timezone</label>
                <select
                  value={formTimezone}
                  onChange={(e) => setFormTimezone(e.target.value)}
                  className="w-full bg-[#333333] border border-slate-700 rounded-lg text-sm text-white
                    focus:ring-[#F6921E] focus:border-[#F6921E] py-2.5 px-3 outline-none"
                >
                  {timezones.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
            </div>

            {/* Column 3 — Recurring Days + Buttons */}
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-3">Recurring Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAY_LABELS.map((day, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border text-xs font-bold transition-all
                        ${recurringDays[idx]
                          ? 'bg-[#F6921E] text-[#333333] border-[#F6921E]'
                          : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 bg-[#333333] text-slate-100 px-6 py-3 rounded-xl text-sm font-bold
                    border border-slate-700 hover:bg-slate-800 transition-all uppercase tracking-widest"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-[#F6921E] text-[#333333] px-6 py-3 rounded-xl text-sm font-black
                    hover:bg-[#D47C16] transition-all uppercase tracking-widest shadow-lg shadow-[#F6921E]/20
                    disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Scheduling...' : 'Schedule Shift'}
                </button>
              </div>
            </div>

          </form>
        </section>
      </div>
    </div>
  );
};

export default AdminHVNCSchedules;
