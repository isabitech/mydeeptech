import React, { useState, useEffect } from 'react';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useAdminHVNCSchedules } from '../../../../hooks/HVNC/Admin/useAdminHVNCSchedules';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Shift {
  time: string;
  person: string;
  device: string;
  isPrimary: boolean;
}

interface DayColumn {
  label: string;
  date: string;
  isToday?: boolean;
  isWeekend?: boolean;
  shifts: Shift[];
  isEmpty?: boolean;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const weekDays: DayColumn[] = [
  {
    label: 'Mon', date: '02',
    shifts: [
      { time: '09:00 - 17:00', person: 'John Doe',     device: 'PC-ALPHA-01', isPrimary: true },
      { time: '17:00 - 01:00', person: 'Emma Wilson',  device: 'PC-BETA-04',  isPrimary: false },
    ],
  },
  {
    label: 'Tue', date: '03',
    shifts: [
      { time: '09:00 - 17:00', person: 'Sarah Miller', device: 'PC-GAMMA-02', isPrimary: true },
    ],
    isEmpty: true, // shows the "+ Add Shift" slot after shifts
  },
  {
    label: 'Wed', date: '04', isToday: true,
    shifts: [
      { time: '09:00 - 17:00', person: 'John Doe',    device: 'PC-ALPHA-01', isPrimary: true },
      { time: '17:00 - 01:00', person: 'David Smith', device: 'PC-BETA-04',  isPrimary: false },
    ],
  },
  {
    label: 'Thu', date: '05',
    shifts: [
      { time: '09:00 - 17:00', person: 'Mike Ross', device: 'PC-DELTA-03', isPrimary: true },
    ],
  },
  {
    label: 'Fri', date: '06',
    shifts: [
      { time: '09:00 - 17:00', person: 'Sarah Miller', device: 'PC-GAMMA-02',   isPrimary: true },
      { time: '01:00 - 09:00', person: 'Alex Chen',    device: 'PC-EPSILON-05', isPrimary: false },
    ],
  },
  {
    label: 'Sat', date: '07', isWeekend: true,
    shifts: [],
  },
  {
    label: 'Sun', date: '08', isWeekend: true,
    shifts: [],
  },
];

// Static fallbacks — replaced by API data when available
const FALLBACK_USERS = ['John Doe', 'Sarah Miller', 'Emma Wilson', 'Mike Ross', 'David Smith', 'Alex Chen'];
const FALLBACK_DEVICES = ['PC-ALPHA-01', 'PC-BETA-04', 'PC-GAMMA-02', 'PC-DELTA-03', 'PC-EPSILON-05'];
const timezones = [
  '(GMT-05:00) Eastern Time',
  '(GMT-08:00) Pacific Time',
  '(GMT+00:00) UTC',
  '(GMT+01:00) West Africa Time',
];

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DEFAULT_DAYS = [true, true, true, true, true, false, false];

// ─── Sub-components ───────────────────────────────────────────────────────────

const ShiftCard = ({ shift, isToday }: { shift: Shift; isToday?: boolean }) => (
  <div
    className={`p-4 rounded-xl border-l-4 transition-all
      ${shift.isPrimary
        ? `border-l-[#F6921E] bg-[rgba(43,43,43,0.6)] backdrop-blur-sm border border-white/5 ${isToday ? 'ring-1 ring-[#F6921E]/20' : ''}`
        : 'border-l-slate-600 bg-[rgba(43,43,43,0.6)] backdrop-blur-sm border border-white/5 opacity-80'
      }`}
  >
    <p className={`text-[10px] font-bold uppercase mb-1 ${shift.isPrimary ? 'text-[#F6921E]' : 'text-slate-400'}`}>
      {shift.time}
    </p>
    <p className="font-bold text-sm text-white">{shift.person}</p>
    <p className="text-xs text-slate-400 mt-0.5">Device: {shift.device}</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

type ViewMode = 'Month' | 'Week' | 'Day';

const AdminHVNCSchedules: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('Month');
  const [recurringDays, setRecurringDays] = useState<boolean[]>(DEFAULT_DAYS);
  const [formUser, setFormUser] = useState('');
  const [formDevice, setFormDevice] = useState('');
  const [formStart, setFormStart] = useState('09:00');
  const [formEnd, setFormEnd] = useState('17:00');
  const [formTimezone, setFormTimezone] = useState(timezones[0]);

  const {
    loading,
    shiftUsers,
    shiftDevices,
    createShift,
    loadFormOptions,
  } = useAdminHVNCSchedules();

  // Derive display lists — use API data if available, else static fallback
  const userOptions = shiftUsers.length > 0
    ? shiftUsers.map((u) => u.name)
    : FALLBACK_USERS;

  const deviceOptions = shiftDevices.length > 0
    ? shiftDevices.map((d) => d.name)
    : FALLBACK_DEVICES;

  useEffect(() => {
    loadFormOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDay = (idx: number) => {
    setRecurringDays((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUser || !formDevice) {
      message.warning('Please select a user and device.');
      return;
    }

    // Find IDs if API data available, else pass name as ID (backend handles lookup)
    const userObj = shiftUsers.find((u) => u.name === formUser);
    const deviceObj = shiftDevices.find((d) => d.name === formDevice);

    const daysOfWeek = recurringDays
      .map((active, idx) => (active ? idx + 1 : null))
      .filter((d): d is number => d !== null);

    const res = await createShift({
      userId: userObj?.id ?? formUser,
      deviceId: deviceObj?.id ?? formDevice,
      startTime: formStart,
      endTime: formEnd,
      timezone: formTimezone,
      isRecurring: true,
      daysOfWeek,
    });

    if (res.success) {
      message.success(`Shift scheduled for ${formUser} on ${formDevice}`);
      handleClear();
    } else {
      message.error(res.error ?? 'Failed to schedule shift');
    }
  };

  const handleClear = () => {
    setFormUser('');
    setFormDevice('');
    setFormStart('09:00');
    setFormEnd('17:00');
    setRecurringDays(DEFAULT_DAYS);
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
          <span className="text-[#F6921E] ml-2">— March 2026</span>
        </h1>
        <div className="flex items-center gap-4">
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

        {/* ── Weekly Calendar ──────────────────────────────────────── */}
        <section className="space-y-3">
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
                ) : (
                  <>
                    {day.shifts.map((shift, idx) => (
                      <ShiftCard key={idx} shift={shift} isToday={day.isToday} />
                    ))}
                    {/* Add Shift slot for Tuesday */}
                    {day.isEmpty && (
                      <div className="bg-[#F6921E]/5 border border-dashed border-[#F6921E]/30 rounded-xl flex items-center justify-center py-8">
                        <button className="text-[#F6921E] text-xs font-bold hover:underline flex items-center gap-1">
                          <PlusOutlined className="text-xs" /> Add Shift
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
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
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Select User</label>
                <select
                  value={formUser}
                  onChange={(e) => setFormUser(e.target.value)}
                  className="w-full bg-[#333333] border border-slate-700 rounded-lg text-sm text-white
                    focus:ring-[#F6921E] focus:border-[#F6921E] py-2.5 px-3 outline-none"
                >
                  <option value="">Select a user...</option>
                  {userOptions.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Assign Device</label>
                <select
                  value={formDevice}
                  onChange={(e) => setFormDevice(e.target.value)}
                  className="w-full bg-[#333333] border border-slate-700 rounded-lg text-sm text-white
                    focus:ring-[#F6921E] focus:border-[#F6921E] py-2.5 px-3 outline-none"
                >
                  <option value="">Select a device...</option>
                  {deviceOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Column 2 — Times + Timezone */}
            <div className="space-y-4">
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
