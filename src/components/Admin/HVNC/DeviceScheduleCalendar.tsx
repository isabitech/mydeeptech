import React, { useState, useEffect } from 'react';
import { Button, Spin, Tooltip, Badge, Progress } from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined,
  UserOutlined,
  BarChartOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAdminHVNCMultiAssignment } from '../../../hooks/HVNC/Admin/useAdminHVNCMultiAssignment';
import { 
  HVNCDeviceScheduleResponse, 
  HVNCScheduleSlot,
  HVNCUtilizationStats 
} from '../../../hooks/HVNC/hvnc.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeviceScheduleCalendarProps {
  deviceId: string;
  deviceName?: string;
  onTimeSlotClick?: (slot: HVNCScheduleSlot, day: string) => void;
  onRefresh?: () => void;
}

interface TimeSlotProps {
  slot?: HVNCScheduleSlot;
  time: string;
  day: string;
  isAvailable: boolean;
  onClick?: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '00:00-02:00', '02:00-04:00', '04:00-06:00', '06:00-08:00',
  '08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00',
  '16:00-18:00', '18:00-20:00', '20:00-22:00', '22:00-24:00'
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const TimeSlot: React.FC<TimeSlotProps> = ({ slot, time, day, isAvailable, onClick }) => {
  const slotContent = slot ? (
    <Tooltip
      title={
        <div className="space-y-1">
          <p className="font-semibold">{slot.userName}</p>
          <p className="text-xs">{slot.userEmail}</p>
          <p className="text-xs">Time: {slot.timeSlot}</p>
          <p className="text-xs">Status: {slot.status}</p>
        </div>
      }
      placement="top"
    >
      <div
        className={`
          p-2 rounded-lg cursor-pointer transition-all duration-200 h-16 flex flex-col justify-center
          ${slot.status === 'active' 
            ? 'bg-[#F6921E]/20 border border-[#F6921E]/50 hover:bg-[#F6921E]/30' 
            : 'bg-slate-600/20 border border-slate-600/50 hover:bg-slate-600/30'
          }
        `}
        onClick={onClick}
      >
        <p className="text-xs font-medium text-white truncate">{slot.userName}</p>
        <p className="text-[10px] text-slate-300 truncate">{slot.timeSlot}</p>
      </div>
    </Tooltip>
  ) : isAvailable ? (
    <div
      className="p-2 rounded-lg border border-dashed border-slate-600 h-16 flex items-center justify-center cursor-pointer hover:border-[#F6921E] hover:bg-[#F6921E]/5 transition-all duration-200"
      onClick={onClick}
    >
      <span className="text-slate-500 text-xs">Available</span>
    </div>
  ) : (
    <div className="p-2 rounded-lg border border-slate-700 bg-slate-800/50 h-16 flex items-center justify-center">
      <span className="text-slate-600 text-xs">Unavailable</span>
    </div>
  );

  return slotContent;
};

const UtilizationCard: React.FC<{ stats: HVNCUtilizationStats }> = ({ stats }) => (
  <div className="bg-[#333333] p-4 rounded-xl border border-white/10 space-y-3">
    <div className="flex items-center gap-2 mb-3">
      <BarChartOutlined className="text-[#F6921E]" />
      <h4 className="text-white font-semibold">Device Utilization</h4>
    </div>
    
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-300">Overall Usage</span>
          <span className="text-white font-medium">{stats.utilizationPercentage.toFixed(1)}%</span>
        </div>
        <Progress
          percent={stats.utilizationPercentage}
          strokeColor="#F6921E"
          trailColor="rgba(255,255,255,0.1)"
          size="small"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#F6921E]">{stats.totalHoursScheduled}h</p>
          <p className="text-xs text-slate-400">Scheduled</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{stats.totalHoursAvailable - stats.totalHoursScheduled}h</p>
          <p className="text-xs text-slate-400">Available</p>
        </div>
      </div>
      
      <div className="pt-2 border-t border-white/10">
        <p className="text-xs text-slate-400">Peak Usage: <span className="text-white">{stats.peakUsageDay}</span> ({stats.peakUsageHours}h)</p>
        <p className="text-xs text-slate-400">Busy Days: <span className="text-white">{stats.busyDays.join(', ')}</span></p>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const DeviceScheduleCalendar: React.FC<DeviceScheduleCalendarProps> = ({
  deviceId,
  deviceName,
  onTimeSlotClick,
  onRefresh,
}) => {
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = current week, -1 = last week, 1 = next week
  const [scheduleData, setScheduleData] = useState<HVNCDeviceScheduleResponse | null>(null);
  
  const { getDeviceSchedule, loading } = useAdminHVNCMultiAssignment();

  const fetchSchedule = async () => {
    const result = await getDeviceSchedule(deviceId, currentWeek, true);
    if (result.success && result.data) {
      setScheduleData(result.data);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [deviceId, currentWeek]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => direction === 'next' ? prev + 1 : prev - 1);
  };

  const handleRefresh = () => {
    fetchSchedule();
    onRefresh?.();
  };

  const handleTimeSlotClick = (slot: HVNCScheduleSlot | undefined, day: string, time: string) => {
    if (slot) {
      onTimeSlotClick?.(slot, day);
    } else {
      // Handle empty slot click - could open assignment modal
      console.log(`Empty slot clicked: ${day} ${time}`);
    }
  };

  const getWeekDisplayText = () => {
    const baseDate = dayjs().add(currentWeek, 'week');
    const startOfWeek = baseDate.startOf('week');
    const endOfWeek = baseDate.endOf('week');
    
    if (currentWeek === 0) return 'This Week';
    if (currentWeek === -1) return 'Last Week';
    if (currentWeek === 1) return 'Next Week';
    
    return `${startOfWeek.format('MMM DD')} - ${endOfWeek.format('MMM DD')}`;
  };

  const getDateForDay = (dayName: string) => {
    const baseDate = dayjs().add(currentWeek, 'week');
    const startOfWeek = baseDate.startOf('week');
    const dayIndex = DAYS_OF_WEEK.indexOf(dayName);
    return startOfWeek.add(dayIndex, 'day').format('DD');
  };

  const isSlotAvailable = (day: string, timeSlot: string): boolean => {
    if (!scheduleData?.availableTimeSlots) return false;
    const daySlots = scheduleData.availableTimeSlots.find(slot => slot.day === day);
    return daySlots?.availableSlots.some(availableSlot => availableSlot.includes(timeSlot.split('-')[0])) || false;
  };

  const getSlotForTime = (day: string, timeSlot: string): HVNCScheduleSlot | undefined => {
    const daySchedule = scheduleData?.schedule[day] || [];
    return daySchedule.find(slot => slot.timeSlot === timeSlot);
  };

  if (loading && !scheduleData) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#333333] rounded-xl">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#F6921E] p-2 rounded-lg">
            <CalendarOutlined className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-white text-xl font-bold">Schedule Calendar</h3>
            <p className="text-slate-400 text-sm">Device: {deviceName || deviceId}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
            className="border-white/20 text-white hover:border-[#F6921E] hover:text-[#F6921E]"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="xl:col-span-3">
          <div className="bg-[#333333] rounded-xl border border-white/10 overflow-hidden">
            {/* Week Navigation */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <Button
                icon={<LeftOutlined />}
                onClick={() => navigateWeek('prev')}
                className="border-white/20 text-white hover:border-[#F6921E] hover:text-[#F6921E]"
              >
                Previous
              </Button>
              
              <h4 className="text-white font-semibold text-lg">{getWeekDisplayText()}</h4>
              
              <Button
                icon={<RightOutlined />}
                onClick={() => navigateWeek('next')}
                className="border-white/20 text-white hover:border-[#F6921E] hover:text-[#F6921E]"
              >
                Next
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              <div className="grid grid-cols-8 gap-2">
                {/* Time column header */}
                <div className="font-semibold text-slate-400 text-sm">Time</div>
                
                {/* Day headers */}
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="text-center space-y-1">
                    <div className="font-semibold text-white text-sm">{day.slice(0, 3)}</div>
                    <div className="text-xs text-slate-400">{getDateForDay(day)}</div>
                  </div>
                ))}

                {/* Time slots */}
                {TIME_SLOTS.map(timeSlot => (
                  <React.Fragment key={timeSlot}>
                    {/* Time label */}
                    <div className="text-[10px] text-slate-400 font-mono py-2">
                      {timeSlot}
                    </div>
                    
                    {/* Day slots */}
                    {DAYS_OF_WEEK.map(day => {
                      const slot = getSlotForTime(day, timeSlot);
                      const isAvailable = isSlotAvailable(day, timeSlot);
                      
                      return (
                        <TimeSlot
                          key={`${day}-${timeSlot}`}
                          slot={slot}
                          time={timeSlot}
                          day={day}
                          isAvailable={isAvailable}
                          onClick={() => handleTimeSlotClick(slot, day, timeSlot)}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Utilization Stats */}
        <div className="space-y-4">
          {scheduleData?.utilizationStats && (
            <UtilizationCard stats={scheduleData.utilizationStats} />
          )}
          
          {/* Legend */}
          <div className="bg-[#333333] p-4 rounded-xl border border-white/10 space-y-3">
            <h4 className="text-white font-semibold">Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#F6921E]/20 border border-[#F6921E]/50"></div>
                <span className="text-sm text-slate-300">Assigned</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-dashed border-slate-600"></div>
                <span className="text-sm text-slate-300">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-slate-700 bg-slate-800/50"></div>
                <span className="text-sm text-slate-300">Unavailable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceScheduleCalendar;