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

export const useDeviceDetection = () => {
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
      // Detect device type
      const deviceType = detectDeviceType();
      if (deviceType) {
        newDetectionStatus.deviceType = { detected: true, value: deviceType, manual: false };
        form.setFieldValue('deviceType', deviceType);
      }

      // Detect operating system
      const os = detectOperatingSystem();
      if (os) {
        newDetectionStatus.operatingSystem = { detected: true, value: os, manual: false };
        form.setFieldValue('operatingSystem', os);
      }

      // Detect internet speed
      const speed = await detectInternetSpeed();
      if (speed !== null && speed > 0) {
        newDetectionStatus.internetSpeed = { detected: true, value: speed, manual: false };
        form.setFieldValue('internetSpeedMbps', speed);
      }

      // Detect power backup
      const powerBackup = await detectPowerBackup();
      if (powerBackup !== null) {
        newDetectionStatus.powerBackup = { detected: true, value: powerBackup, manual: false };
        form.setFieldValue('powerBackup', powerBackup);
      }

      // Detect media devices
      const mediaDevices = await detectMediaDevices();
      newDetectionStatus.hasWebcam = { detected: true, value: mediaDevices.webcam, manual: false };
      newDetectionStatus.hasMicrophone = { detected: true, value: mediaDevices.microphone, manual: false };
      form.setFieldValue('hasWebcam', mediaDevices.webcam);
      form.setFieldValue('hasMicrophone', mediaDevices.microphone);

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