import React, { useState, useEffect } from 'react';
import { Modal, Select, TimePicker, Checkbox, Button, message, Spin, Alert } from 'antd';
import { UserOutlined, ClockCircleOutlined, CalendarOutlined, PlusOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAdminHVNCMultiAssignment } from '../../../hooks/HVNC/Admin/useAdminHVNCMultiAssignment';
import { useGetAllDtUsers } from '../../../hooks/Auth/Admin/Annotators/useGetAllDtUsers';
import { 
  HVNCUserAssignmentInput, 
  HVNCBulkAssignmentResult, 
  HVNCAssignmentFailure 
} from '../../../hooks/HVNC/hvnc.types';

const { Option } = Select;

// ─── Types ────────────────────────────────────────────────────────────────────

interface MultiUserAssignmentProps {
  open: boolean;
  onCancel: () => void;
  deviceId: string;
  deviceName?: string;
  onAssignmentSuccess?: (result: HVNCBulkAssignmentResult) => void;
  onAssignmentError?: (error: string) => void;
}

interface UserAssignment {
  userId: string;
  userName: string;
  userEmail: string;
  startTime: dayjs.Dayjs | null;
  endTime: dayjs.Dayjs | null;
  assignedDays: string[];
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

// ─── Component ────────────────────────────────────────────────────────────────

const MultiUserAssignment: React.FC<MultiUserAssignmentProps> = ({
  open,
  onCancel,
  deviceId,
  deviceName,
  onAssignmentSuccess,
  onAssignmentError,
}) => {
  const [assignments, setAssignments] = useState<UserAssignment[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [bulkResult, setBulkResult] = useState<HVNCBulkAssignmentResult | null>(null);

  const { assignMultipleUsers, loading: assignmentLoading } = useAdminHVNCMultiAssignment();
  const { getAllDTUsers, loading: usersLoading, users } = useGetAllDtUsers();

  // Load users when modal opens
  useEffect(() => {
    if (open) {
      getAllDTUsers({ status: 'approved', limit: 1000 });
      setAssignments([createEmptyAssignment()]);
      setShowResults(false);
      setBulkResult(null);
    }
  }, [open, getAllDTUsers]);

  const createEmptyAssignment = (): UserAssignment => ({
    userId: '',
    userName: '',
    userEmail: '',
    startTime: null,
    endTime: null,
    assignedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  });

  const addAssignment = () => {
    setAssignments(prev => [...prev, createEmptyAssignment()]);
  };

  const removeAssignment = (index: number) => {
    setAssignments(prev => prev.filter((_, i) => i !== index));
  };

  const updateAssignment = (index: number, field: keyof UserAssignment, value: any) => {
    setAssignments(prev => prev.map((assignment, i) => {
      if (i === index) {
        if (field === 'userId') {
          const selectedUser = users.find(user => user._id === value);
          return {
            ...assignment,
            userId: value,
            userName: selectedUser?.fullName || '',
            userEmail: selectedUser?.email || '',
          };
        }
        return { ...assignment, [field]: value };
      }
      return assignment;
    }));
  };

  const validateAssignments = (): boolean => {
    for (let i = 0; i < assignments.length; i++) {
      const assignment = assignments[i];
      if (!assignment.userId) {
        message.error(`Please select a user for assignment ${i + 1}`);
        return false;
      }
      if (!assignment.startTime || !assignment.endTime) {
        message.error(`Please set start and end time for assignment ${i + 1}`);
        return false;
      }
      if (assignment.assignedDays.length === 0) {
        message.error(`Please select at least one day for assignment ${i + 1}`);
        return false;
      }
      if (assignment.startTime.isAfter(assignment.endTime)) {
        message.error(`End time must be after start time for assignment ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateAssignments()) return;

    setSubmitting(true);
    try {
      const userAssignments: HVNCUserAssignmentInput[] = assignments.map(assignment => ({
        userId: assignment.userId,
        startTime: assignment.startTime!.format('HH:mm'),
        endTime: assignment.endTime!.format('HH:mm'),
        assignedDays: assignment.assignedDays,
      }));

      const result = await assignMultipleUsers(deviceId, userAssignments);
      
      if (result.success && result.data) {
        setBulkResult(result.data);
        setShowResults(true);
        
        if (result.data.totalFailed === 0) {
          message.success(`All ${result.data.totalSuccessful} users assigned successfully!`);
          onAssignmentSuccess?.(result.data);
        } else {
          message.warning(
            `${result.data.totalSuccessful} users assigned successfully, ${result.data.totalFailed} failed due to conflicts`
          );
        }
      } else {
        const errorMsg = result.error || 'Failed to assign users';
        message.error(errorMsg);
        onAssignmentError?.(errorMsg);
      }
    } catch (error) {
      const errorMsg = 'Unexpected error during assignment';
      message.error(errorMsg);
      onAssignmentError?.(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setAssignments([createEmptyAssignment()]);
    setSearchUser('');
    setShowResults(false);
    setBulkResult(null);
    onCancel();
  };

  const filteredUsers = users.filter(user => 
    !searchUser || 
    user.fullName?.toLowerCase().includes(searchUser.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div className="bg-[#F6921E] p-2 rounded-lg">
            <UserOutlined className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-white text-lg font-bold">Assign Multiple Users</h3>
            <p className="text-slate-400 text-sm">Device: {deviceName || deviceId}</p>
          </div>
        </div>
      }
      open={open}
      onCancel={handleClose}
      width={800}
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
        
        {/* Results Display */}
        {showResults && bulkResult && (
          <div className="space-y-4 mb-6">
            {bulkResult.totalSuccessful > 0 && (
              <Alert
                type="success"
                message={`${bulkResult.totalSuccessful} users assigned successfully`}
                description={
                  <ul className="mt-2 space-y-1">
                    {bulkResult.successfulAssignments.map(assignment => (
                      <li key={assignment.userId} className="text-sm">
                        {assignment.message} (Shift ID: {assignment.shiftId})
                      </li>
                    ))}
                  </ul>
                }
              />
            )}

            {bulkResult.totalFailed > 0 && (
              <Alert
                type="warning"
                message={`${bulkResult.totalFailed} assignments failed due to conflicts`}
                description={
                  <div className="mt-2 space-y-2">
                    {bulkResult.failedAssignments.map((failure, index) => (
                      <div key={index} className="text-sm">
                        <p className="font-semibold">{failure.error}</p>
                        {failure.conflicts && failure.conflicts.map((conflict, cIndex) => (
                          <p key={cIndex} className="ml-4 text-xs">
                            {conflict.day}: {conflict.conflictStart}-{conflict.conflictEnd} 
                            conflicts with {conflict.existingUser?.name} ({conflict.existingUser?.timeSlot})
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                }
              />
            )}
          </div>
        )}

        {/* Assignment Forms */}
        <div className="space-y-4">
          {assignments.map((assignment, index) => (
            <div key={index} className="bg-[#333333] p-4 rounded-xl border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-white font-semibold">Assignment #{index + 1}</h4>
                {assignments.length > 1 && (
                  <Button 
                    type="link" 
                    danger 
                    onClick={() => removeAssignment(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User Selection */}
                <div className="space-y-2">
                  <label className="text-slate-300 text-sm font-medium">Select User</label>
                  <Select
                    placeholder="Search and select user..."
                    value={assignment.userId || undefined}
                    onChange={(value) => updateAssignment(index, 'userId', value)}
                    showSearch
                    onSearch={setSearchUser}
                    loading={usersLoading}
                    className="w-full"
                    dropdownStyle={{ background: '#2B2B2B', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {filteredUsers.map(user => (
                      <Option key={user._id} value={user._id}>
                        <div className="flex items-center gap-2">
                          <UserOutlined className="text-[#F6921E]" />
                          <span>{user.fullName}</span>
                          <span className="text-slate-400">({user.email})</span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-slate-300 text-sm font-medium">Start Time</label>
                    <TimePicker
                      value={assignment.startTime}
                      onChange={(time) => updateAssignment(index, 'startTime', time)}
                      format="HH:mm"
                      placeholder="Start time"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-slate-300 text-sm font-medium">End Time</label>
                    <TimePicker
                      value={assignment.endTime}
                      onChange={(time) => updateAssignment(index, 'endTime', time)}
                      format="HH:mm"
                      placeholder="End time"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Days Selection */}
              <div className="mt-4 space-y-2">
                <label className="text-slate-300 text-sm font-medium">Assigned Days</label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={assignment.assignedDays.includes(day.value)}
                        onChange={(e) => {
                          const newDays = e.target.checked
                            ? [...assignment.assignedDays, day.value]
                            : assignment.assignedDays.filter(d => d !== day.value);
                          updateAssignment(index, 'assignedDays', newDays);
                        }}
                      />
                      <span className="text-slate-300 text-sm">{day.label.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Assignment Button */}
        <Button 
          type="dashed" 
          onClick={addAssignment}
          icon={<PlusOutlined />}
          className="w-full border-white/20 text-white hover:border-[#F6921E] hover:text-[#F6921E]"
        >
          Add Another User Assignment
        </Button>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={submitting || assignmentLoading}
            icon={<ClockCircleOutlined />}
            className="bg-[#F6921E] hover:bg-[#D47C16] border-none"
          >
            Assign Users
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MultiUserAssignment;