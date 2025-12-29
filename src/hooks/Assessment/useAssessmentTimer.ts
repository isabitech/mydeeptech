import { useState, useEffect, useRef, useCallback } from "react";
import { useTimerControl } from "./useTimerControl";
import { useSaveTaskProgress } from "./useSaveTaskProgress";

interface TimerState {
  isRunning: boolean;
  totalTimeSpent: number; // in milliseconds
  timeRemaining: number; // in milliseconds
  timeLimit: number; // in milliseconds
  lastStartTime: number | null;
}

interface UseAssessmentTimerProps {
  submissionId: string;
  initialTimeLimit: number; // in minutes
  initialTimeSpent?: number; // in milliseconds
  autoSaveInterval?: number; // in seconds, default 30
  onTimeExpired?: () => void;
  onTimerUpdate?: (timeState: TimerState) => void;
}

export const useAssessmentTimer = ({
  submissionId,
  initialTimeLimit,
  initialTimeSpent = 0,
  autoSaveInterval = 30,
  onTimeExpired,
  onTimerUpdate,
}: UseAssessmentTimerProps) => {
  const { controlTimer } = useTimerControl();
  const { saveProgress } = useSaveTaskProgress();

  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    totalTimeSpent: initialTimeSpent,
    timeRemaining: (initialTimeLimit * 60 * 1000) - initialTimeSpent,
    timeLimit: initialTimeLimit * 60 * 1000,
    lastStartTime: null,
  });

  const intervalRef = useRef<number | null>(null);
  const lastSaveRef = useRef<number>(Date.now());
  const currentTaskDataRef = useRef<any>(null);

  // Update current task data for auto-save
  const updateCurrentTaskData = useCallback((taskData: any) => {
    currentTaskDataRef.current = taskData;
  }, []);

  // Start timer
  const startTimer = useCallback(async () => {
    if (timerState.timeRemaining <= 0) {
      return { success: false, error: "Time limit exceeded" };
    }

    try {
      const result = await controlTimer(submissionId, 'start');
      if (result.success) {
        setTimerState(prev => ({
          ...prev,
          isRunning: true,
          lastStartTime: Date.now(),
        }));
        return { success: true };
      }
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [submissionId, controlTimer, timerState.timeRemaining]);

  // Pause timer
  const pauseTimer = useCallback(async () => {
    try {
      const result = await controlTimer(submissionId, 'pause');
      if (result.success) {
        setTimerState(prev => {
          const now = Date.now();
          const sessionTime = prev.lastStartTime ? now - prev.lastStartTime : 0;
          const newTotalTime = prev.totalTimeSpent + sessionTime;
          
          return {
            ...prev,
            isRunning: false,
            totalTimeSpent: newTotalTime,
            timeRemaining: prev.timeLimit - newTotalTime,
            lastStartTime: null,
          };
        });
        return { success: true };
      }
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [submissionId, controlTimer]);

  // Resume timer
  const resumeTimer = useCallback(async () => {
    if (timerState.timeRemaining <= 0) {
      return { success: false, error: "Time limit exceeded" };
    }

    try {
      const result = await controlTimer(submissionId, 'resume');
      if (result.success) {
        setTimerState(prev => ({
          ...prev,
          isRunning: true,
          lastStartTime: Date.now(),
        }));
        return { success: true };
      }
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [submissionId, controlTimer, timerState.timeRemaining]);

  // Toggle timer (pause/resume)
  const toggleTimer = useCallback(async () => {
    if (timerState.isRunning) {
      return await pauseTimer();
    } else {
      return await resumeTimer();
    }
  }, [timerState.isRunning, pauseTimer, resumeTimer]);

  // Format time for display
  const formatTime = useCallback((milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Get formatted time remaining
  const getFormattedTimeRemaining = useCallback((): string => {
    return formatTime(Math.max(0, timerState.timeRemaining));
  }, [timerState.timeRemaining, formatTime]);

  // Get formatted time spent
  const getFormattedTimeSpent = useCallback((): string => {
    const currentSessionTime = timerState.lastStartTime ? Date.now() - timerState.lastStartTime : 0;
    const totalTime = timerState.totalTimeSpent + currentSessionTime;
    return formatTime(totalTime);
  }, [timerState.totalTimeSpent, timerState.lastStartTime, formatTime]);

  // Auto-save progress
  const performAutoSave = useCallback(async () => {
    if (currentTaskDataRef.current && submissionId) {
      try {
        await saveProgress(submissionId, currentTaskDataRef.current);
        lastSaveRef.current = Date.now();
        console.log('📄 Auto-saved progress at:', new Date().toLocaleTimeString());
      } catch (error) {
        console.warn('Failed to auto-save progress:', error);
      }
    }
  }, [submissionId, saveProgress]);

  // Timer update effect
  useEffect(() => {
    if (timerState.isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimerState(prev => {
          if (!prev.lastStartTime) return prev;

          const now = Date.now();
          const sessionTime = now - prev.lastStartTime;
          const newTotalTime = prev.totalTimeSpent + sessionTime;
          const newTimeRemaining = prev.timeLimit - newTotalTime;

          const updatedState = {
            ...prev,
            totalTimeSpent: newTotalTime,
            timeRemaining: newTimeRemaining,
          };

          // Check if time expired
          if (newTimeRemaining <= 0) {
            updatedState.isRunning = false;
            updatedState.timeRemaining = 0;
            updatedState.lastStartTime = null;
            
            // Trigger time expired callback
            if (onTimeExpired) {
              setTimeout(onTimeExpired, 100);
            }
          }

          // Trigger timer update callback
          if (onTimerUpdate) {
            onTimerUpdate(updatedState);
          }

          return updatedState;
        });

        // Auto-save check
        const now = Date.now();
        const timeSinceLastSave = (now - lastSaveRef.current) / 1000;
        if (timeSinceLastSave >= autoSaveInterval) {
          performAutoSave();
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning, autoSaveInterval, onTimeExpired, onTimerUpdate, performAutoSave]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Calculate progress percentage
  const getProgressPercentage = useCallback((): number => {
    const timeUsed = timerState.timeLimit - timerState.timeRemaining;
    return Math.min(100, (timeUsed / timerState.timeLimit) * 100);
  }, [timerState.timeLimit, timerState.timeRemaining]);

  // Check if timer is close to expiring (less than 5 minutes)
  const isCloseToExpiring = useCallback((): boolean => {
    return timerState.timeRemaining <= 5 * 60 * 1000; // 5 minutes in milliseconds
  }, [timerState.timeRemaining]);

  return {
    // Timer state
    timerState,
    isRunning: timerState.isRunning,
    timeRemaining: timerState.timeRemaining,
    totalTimeSpent: timerState.totalTimeSpent,
    
    // Timer controls
    startTimer,
    pauseTimer,
    resumeTimer,
    toggleTimer,
    
    // Utility functions
    updateCurrentTaskData,
    performAutoSave,
    getFormattedTimeRemaining,
    getFormattedTimeSpent,
    getProgressPercentage,
    isCloseToExpiring,
    formatTime,
    
    // Status checks
    isTimeExpired: timerState.timeRemaining <= 0,
    canStart: timerState.timeRemaining > 0 && !timerState.isRunning,
    canPause: timerState.isRunning,
    canResume: !timerState.isRunning && timerState.timeRemaining > 0,
  };
};