import { MediaDevicesResult } from '../../types';

/**
 * Detect device type based on user agent and screen characteristics
 */
export const detectDeviceType = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  const screenWidth = window.screen.width;
  const isTouchDevice = 'ontouchstart' in window;

  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(userAgent)) {
    return 'mobile';
  } else if (/tablet|ipad/i.test(userAgent) || (isTouchDevice && screenWidth < 1024)) {
    return 'tablet';
  } else if (screenWidth >= 1024) {
    // Check if it's likely a laptop vs desktop based on battery API and screen size
    if (screenWidth <= 1920 && 'getBattery' in navigator) {
      return 'laptop';
    }
    return 'desktop';
  }
  return 'desktop';
};

/**
 * Detect operating system from user agent
 */
export const detectOperatingSystem = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/windows/i.test(userAgent)) return 'windows';
  if (/mac os|macos|macintosh/i.test(userAgent)) return 'macos';
  if (/linux/i.test(userAgent) && !/android/i.test(userAgent)) return 'linux';
  if (/android/i.test(userAgent)) return 'android';
  if (/ios|iphone|ipad|ipod/i.test(userAgent)) return 'ios';
  
  return '';
};

/**
 * Detect internet speed using Network Information API or fallback speed test
 */
export const detectInternetSpeed = async (): Promise<number | null> => {
  try {
    // Use Network Information API if available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection && connection.downlink) {
      return Math.round(connection.downlink);
    }

    // Fallback: Simple speed test (download small image)
    const startTime = performance.now();
    const image = new Image();
    
    return new Promise((resolve) => {
      image.onload = () => {
        const endTime = performance.now();
        const duration = (endTime - startTime) / 1000; // seconds
        const bitsLoaded = image.src.length * 8;
        const speedBps = bitsLoaded / duration;
        const speedMbps = Math.round(speedBps / (1024 * 1024));
        resolve(speedMbps > 0 ? speedMbps : null);
      };
      image.onerror = () => resolve(null);
      // Use a small test image
      image.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==?t=${Date.now()}`;
    });
  } catch (error) {
    return null;
  }
};

/**
 * Detect power backup using Battery API
 */
export const detectPowerBackup = async (): Promise<boolean | null> => {
  try {
    // Use Battery API if available
    const battery = await (navigator as any).getBattery?.();
    if (battery) {
      // If charging and battery level is high, or if it's a desktop, assume power backup
      return battery.charging || !battery.dischargingTime || battery.dischargingTime === Infinity;
    }
  } catch (error) {
    // Battery API not supported or blocked
  }
  return null;
};

/**
 * Detect available media devices (webcam and microphone)
 */
export const detectMediaDevices = async (): Promise<MediaDevicesResult> => {
  try {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return { webcam: false, microphone: false };
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasVideoInput = devices.some(device => device.kind === 'videoinput');
    const hasAudioInput = devices.some(device => device.kind === 'audioinput');

    return { webcam: hasVideoInput, microphone: hasAudioInput };
  } catch (error) {
    // Fallback: Try to access media to check availability
    try {
      const stream = await navigator.mediaDevices?.getUserMedia({ video: true, audio: true });
      if (stream) {
        // Stop all tracks to release the devices
        stream.getTracks().forEach(track => track.stop());
        return { webcam: true, microphone: true };
      }
    } catch {
      // Try individually
      try {
        const videoStream = await navigator.mediaDevices?.getUserMedia({ video: true });
        const audioStream = await navigator.mediaDevices?.getUserMedia({ audio: true });
        videoStream?.getTracks().forEach(track => track.stop());
        audioStream?.getTracks().forEach(track => track.stop());
        return { webcam: !!videoStream, microphone: !!audioStream };
      } catch {
        return { webcam: false, microphone: false };
      }
    }
  }
  return { webcam: false, microphone: false };
};