import React, { useState } from 'react';
import { Modal, Alert, Button, TimePicker, Checkbox, message, Divider } from 'antd';
import { 
  WarningOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
  HVNCAssignmentFailure, 
  HVNCTimeConflict,
  HVNCUserAssignmentInput 
} from '../../../hooks/HVNC/hvnc.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConflictResolutionModalProps {
  open: boolean;
  onCancel: () => void;
  conflicts: HVNCAssignmentFailure[];
  deviceName?: string;
  onResolve: (resolvedAssignments: HVNCUserAssignmentInput[]) => void;
  onRetry: () => void;
}

interface ConflictResolution {
  userId: string;
  action: 'retry' | 'modify' | 'skip';
  newStartTime?: dayjs.Dayjs;
  newEndTime?: dayjs.Dayjs;
  newAssignedDays?: string[];
}

const DAYS_OF_WEEK = [
  { label: 'Monday', value: 'Monday' },
  { label: 'Tuesday', value: 'Tuesday' },
  { label: 'Wednesday', value: 'Wednesday' },
  { label: 'Thursday', value: 'Thursday' },
  { label: 'Friday', value: 'Friday' },
  { label: 'Saturday', value: 'Saturday' },
  { label: 'Sunday', value: 'Sunday' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ConflictItemProps {
  failure: HVNCAssignmentFailure;
  resolution: ConflictResolution;
  onUpdate: (resolution: ConflictResolution) => void;
  userInfo?: { name: string; email: string };
}

const ConflictItem: React.FC<ConflictItemProps> = ({ 
  failure, 
  resolution, 
  onUpdate,
  userInfo 
}) => {
  const updateResolution = (updates: Partial<ConflictResolution>) => {
    onUpdate({ ...resolution, ...updates });
  };

  const hasTimeConflicts = failure.conflicts && failure.conflicts.length > 0;

  return (
    <div className="bg-[#2B2B2B] p-4 rounded-xl border border-red-500/20 space-y-4">
      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="bg-red-500/20 p-2 rounded-lg">
          <UserOutlined className="text-red-400" />
        </div>
        <div>
          <p className="text-white font-semibold">{userInfo?.name || failure.userId}</p>
          <p className="text-slate-400 text-sm">{userInfo?.email}</p>
        </div>
      </div>

      {/* Error Details */}
      <Alert
        type="error"
        message={failure.error}
        description={
          hasTimeConflicts && (
            <div className="mt-2 space-y-2">
              {failure.conflicts!.map((conflict, index) => (
                <div key={index} className="text-sm">
                  <p className="font-semibold">{conflict.day}</p>
                  <p className="text-xs">
                    Conflict: {conflict.conflictStart} - {conflict.conflictEnd} 
                    {conflict.existingUser && (
                      <span> with {conflict.existingUser.name} ({conflict.existingUser.timeSlot})</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )
        }
        showIcon
        icon={<ExclamationCircleOutlined />}
      />

      {/* Resolution Actions */}
      <div className="space-y-3">
        <p className="text-slate-300 font-medium">Choose Resolution:</p>
        
        <div className="space-y-3">
          {/* Skip Option */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              value="skip"
              checked={resolution.action === 'skip'}
              onChange={() => updateResolution({ action: 'skip' })}
              className="text-[#F6921E]"
            />
            <ExclamationCircleOutlined className="text-slate-400" />
            <span className="text-slate-300">Skip this assignment</span>
          </label>

          {/* Retry Option */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              value="retry"
              checked={resolution.action === 'retry'}
              onChange={() => updateResolution({ action: 'retry' })}
              className="text-[#F6921E]"
            />
            <ClockCircleOutlined className="text-blue-400" />
            <span className="text-slate-300">Retry with original settings</span>
          </label>

          {/* Modify Option */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              value="modify"
              checked={resolution.action === 'modify'}
              onChange={() => updateResolution({ action: 'modify' })}
              className="text-[#F6921E]"
            />
            <CheckCircleOutlined className="text-green-400" />
            <span className="text-slate-300">Modify time and/or days</span>
          </label>
        </div>

        {/* Modification Options */}
        {resolution.action === 'modify' && (
          <div className="mt-4 p-3 bg-[#333333] rounded-lg space-y-4">
            {/* Time Adjustment */}
            <div>
              <p className="text-slate-300 text-sm font-medium mb-2">Adjust Time:</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Start Time</label>
                  <TimePicker
                    value={resolution.newStartTime}
                    onChange={(time) => updateResolution({ newStartTime: time })}
                    format="HH:mm"
                    placeholder="Start time"
                    size="small"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">End Time</label>
                  <TimePicker
                    value={resolution.newEndTime}
                    onChange={(time) => updateResolution({ newEndTime: time })}
                    format="HH:mm"
                    placeholder="End time"
                    size="small"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Days Adjustment */}
            <div>
              <p className="text-slate-300 text-sm font-medium mb-2">Adjust Days:</p>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <label key={day.value} className="flex items-center gap-1 cursor-pointer">
                    <Checkbox
                      checked={resolution.newAssignedDays?.includes(day.value) || false}
                      onChange={(e) => {
                        const currentDays = resolution.newAssignedDays || [];
                        const newDays = e.target.checked
                          ? [...currentDays, day.value]
                          : currentDays.filter(d => d !== day.value);
                        updateResolution({ newAssignedDays: newDays });
                      }}
                    />
                    <span className="text-slate-300 text-xs">{day.label.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Conflict Suggestions */}
            {hasTimeConflicts && (
              <div className="mt-3 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                <p className="text-blue-400 text-xs font-medium mb-1">💡 Suggestion:</p>
                <p className="text-slate-300 text-xs">
                  Try avoiding these conflicting times:
                  {failure.conflicts!.map(conflict => 
                    ` ${conflict.day} ${conflict.conflictStart}-${conflict.conflictEnd}`
                  ).join(', ')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  open,
  onCancel,
  conflicts,
  deviceName,
  onResolve,
  onRetry,
}) => {
  const [resolutions, setResolutions] = useState<ConflictResolution[]>(() =>
    conflicts.map(failure => ({
      userId: failure.userId,
      action: 'retry',
    }))
  );

  const updateResolution = (index: number, resolution: ConflictResolution) => {
    setResolutions(prev => prev.map((r, i) => i === index ? resolution : r));
  };

  const handleResolve = () => {
    const modificationsToApply: HVNCUserAssignmentInput[] = [];
    
    for (const resolution of resolutions) {
      if (resolution.action === 'modify') {
        if (!resolution.newStartTime || !resolution.newEndTime || !resolution.newAssignedDays?.length) {
          message.error('Please complete all modification fields for modified assignments');
          return;
        }
        
        modificationsToApply.push({
          userId: resolution.userId,
          startTime: resolution.newStartTime.format('HH:mm'),
          endTime: resolution.newEndTime.format('HH:mm'),
          assignedDays: resolution.newAssignedDays,
        });
      }
    }

    if (modificationsToApply.length > 0) {
      onResolve(modificationsToApply);
    } else {
      // No modifications, just retry
      onRetry();
    }
  };

  const getActionCounts = () => {
    const counts = { skip: 0, retry: 0, modify: 0 };
    resolutions.forEach(resolution => {
      counts[resolution.action]++;
    });
    return counts;
  };

  const actionCounts = getActionCounts();

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div className="bg-red-500/20 p-2 rounded-lg">
            <WarningOutlined className="text-red-400 text-lg" />
          </div>
          <div>
            <h3 className="text-white text-lg font-bold">Resolve Assignment Conflicts</h3>
            <p className="text-slate-400 text-sm">
              Device: {deviceName} • {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      }
      open={open}
      onCancel={onCancel}
      width={900}
      footer={null}
      className="hvnc-modal"
      styles={{
        mask: { backdropFilter: 'blur(8px)' },
        content: { 
          background: 'linear-gradient(135deg, #2B2B2B, #333333)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'white'
        }
      }}
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        
        {/* Summary */}
        <Alert
          type="warning"
          message="Time conflicts detected"
          description={
            <div className="mt-2">
              <p className="text-sm mb-2">
                The following assignments could not be completed due to time conflicts with existing users.
                Please review each conflict and choose a resolution action.
              </p>
              <div className="flex gap-4 text-xs">
                <span>Skip: {actionCounts.skip}</span>
                <span>Retry: {actionCounts.retry}</span>
                <span>Modify: {actionCounts.modify}</span>
              </div>
            </div>
          }
          showIcon
          icon={<WarningOutlined />}
        />

        {/* Conflict Items */}
        <div className="space-y-4">
          {conflicts.map((failure, index) => (
            <ConflictItem
              key={failure.userId}
              failure={failure}
              resolution={resolutions[index]}
              onUpdate={(resolution) => updateResolution(index, resolution)}
              userInfo={{
                name: `User ${failure.userId}`, // In real implementation, fetch user details
                email: `user${failure.userId}@example.com`,
              }}
            />
          ))}
        </div>

        <Divider className="border-white/10" />

        {/* Action Summary */}
        <div className="bg-[#333333] p-4 rounded-xl border border-white/10">
          <h4 className="text-white font-semibold mb-3">Resolution Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-400">{actionCounts.skip}</p>
              <p className="text-xs text-slate-500">Will be skipped</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{actionCounts.retry}</p>
              <p className="text-xs text-slate-500">Will retry original</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{actionCounts.modify}</p>
              <p className="text-xs text-slate-500">Will be modified</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleResolve}
            icon={<CheckCircleOutlined />}
            className="bg-[#F6921E] hover:bg-[#D47C16] border-none"
          >
            Apply Resolutions
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConflictResolutionModal;