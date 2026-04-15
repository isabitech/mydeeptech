import { useState, useCallback } from 'react';
import { Form } from 'antd';
import { DetectionStatus } from '../../types';
import {
  detectDeviceType,
  detectOperatingSystem,
  detectInternetSpeed,
  detectPowerBackup,
  detectMediaDevices
} from '../utils/deviceDetectionUtils';

export const useDeviceDetection = (existingSystemInfo?: any) => {
  const [detecting, setDetecting] = useState(true);
  const [detectionStatus, setDetectionStatus] = useState<DetectionStatus>({
    deviceType: { detected: false, manual: false },
    operatingSystem: { detected: false, manual: false },
    internetSpeed: { detected: false, manual: false },
    powerBackup: { detected: false, manual: false },
    hasWebcam: { detected: false, manual: false },
    hasMicrophone: { detected: false, manual: false },
  });

  const form = Form.useFormInstance();

  const performDetection = useCallback(async () => {
    setDetecting(true);
    const newDetectionStatus = { ...detectionStatus };

    try {
      // Get current form values to avoid overriding existing data
      const currentValues = form.getFieldsValue();

      // Check if we have saved system info data
      const hasSavedDeviceType = existingSystemInfo?.deviceType !== undefined && existingSystemInfo?.deviceType !== null;
      const hasSavedOS = existingSystemInfo?.operatingSystem !== undefined && existingSystemInfo?.operatingSystem !== null;
      const hasSavedInternetSpeed = existingSystemInfo?.internetSpeedMbps !== undefined && existingSystemInfo?.internetSpeedMbps !== null;
      const hasSavedPowerBackup = existingSystemInfo?.powerBackup !== undefined && existingSystemInfo?.powerBackup !== null;
      const hasSavedWebcam = existingSystemInfo?.hasWebcam !== undefined && existingSystemInfo?.hasWebcam !== null;
      const hasSavedMicrophone = existingSystemInfo?.hasMicrophone !== undefined && existingSystemInfo?.hasMicrophone !== null;

      // Detect device type - only if no saved data
      const deviceType = detectDeviceType();
      if (deviceType && !hasSavedDeviceType && !currentValues.deviceType) {
        newDetectionStatus.deviceType = { detected: true, value: deviceType, manual: false };
        form.setFieldValue('deviceType', deviceType);
      }

      // Detect operating system - only if no saved data
      const os = detectOperatingSystem();
      if (os && !hasSavedOS && !currentValues.operatingSystem) {
        newDetectionStatus.operatingSystem = { detected: true, value: os, manual: false };
        form.setFieldValue('operatingSystem', os);
      }

      // Detect internet speed - only if no saved data
      const speed = await detectInternetSpeed();
      if (speed !== null && speed > 0 && !hasSavedInternetSpeed && (!currentValues.internetSpeedMbps || currentValues.internetSpeedMbps === 0)) {
        newDetectionStatus.internetSpeed = { detected: true, value: speed, manual: false };
        form.setFieldValue('internetSpeedMbps', speed);
      }

      // Detect power backup - only if no saved data
      const powerBackup = await detectPowerBackup();
      if (powerBackup !== null && !hasSavedPowerBackup && currentValues.powerBackup === undefined) {
        newDetectionStatus.powerBackup = { detected: true, value: powerBackup, manual: false };
        form.setFieldValue('powerBackup', powerBackup);
      }

      // Detect media devices - only if no saved data
      const mediaDevices = await detectMediaDevices();
      if (!hasSavedWebcam && currentValues.hasWebcam === undefined) {
        newDetectionStatus.hasWebcam = { detected: true, value: mediaDevices.webcam, manual: false };
        form.setFieldValue('hasWebcam', mediaDevices.webcam);
      }
      if (!hasSavedMicrophone && currentValues.hasMicrophone === undefined) {
        newDetectionStatus.hasMicrophone = { detected: true, value: mediaDevices.microphone, manual: false };
        form.setFieldValue('hasMicrophone', mediaDevices.microphone);
      }

    } catch (error) {
      console.warn('Device detection failed:', error);
    }

    setDetectionStatus(newDetectionStatus);
    setDetecting(false);
  }, [form, detectionStatus]);

  const toggleManualInput = useCallback((field: keyof DetectionStatus) => {
    setDetectionStatus(prev => ({
      ...prev,
      [field]: { ...prev[field], manual: !prev[field].manual }
    }));
  }, []);

  const getDetectionMessage = useCallback(() => {
    const detectedCount = Object.values(detectionStatus).filter(status => status.detected).length;
    const totalFields = Object.keys(detectionStatus).length;
    
    if (detectedCount === totalFields) {
      return { type: 'success' as const, message: 'All device information detected automatically!' };
    } else if (detectedCount > 0) {
      return { type: 'info' as const, message: `${detectedCount}/${totalFields} fields detected automatically. Please fill in the remaining fields manually.` };
    } else {
      return { type: 'warning' as const, message: 'Automatic detection unavailable. Please fill in all fields manually.' };
    }
  }, [detectionStatus]);

  return {
    detecting,
    detectionStatus,
    performDetection,
    toggleManualInput,
    getDetectionMessage
  };
};