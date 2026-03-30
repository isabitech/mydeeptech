export type Domain = {
  _id: string;
  name: string;
};

// Device Detection Types
export interface DetectionStatus {
  deviceType: DetectionField;
  operatingSystem: DetectionField;
  internetSpeed: DetectionField;
  powerBackup: DetectionField;
  hasWebcam: DetectionField;
  hasMicrophone: DetectionField;
}

export interface DetectionField {
  detected: boolean;
  value?: string | number | boolean;
  manual: boolean;
}

export interface MediaDevicesResult {
  webcam: boolean;
  microphone: boolean;
}

export interface DetectionResult {
  success: boolean;
  value?: any;
  error?: string;
}