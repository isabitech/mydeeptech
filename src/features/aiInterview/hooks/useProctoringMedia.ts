import { useCallback, useEffect, useState } from "react";

type MediaKind = "camera" | "screen";

const getMediaErrorMessage = (error: unknown, kind: MediaKind) => {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return kind === "camera"
        ? "Camera access was blocked. Allow camera permission to enable interview proctoring."
        : "Screen sharing was blocked. Allow screen access and choose your entire screen.";
    }

    if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
      return kind === "camera"
        ? "No camera device was found on this machine."
        : "No shareable display source was found.";
    }

    if (error.name === "NotReadableError") {
      return kind === "camera"
        ? "The camera is already in use by another application."
        : "The selected screen source is already in use by another application.";
    }
  }

  return kind === "camera"
    ? "Unable to start the camera preview."
    : "Unable to start screen sharing.";
};

const stopStream = (stream: MediaStream | null) => {
  stream?.getTracks().forEach((track) => track.stop());
};

export const useProctoringMedia = () => {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [cameraPending, setCameraPending] = useState(false);
  const [screenPending, setScreenPending] = useState(false);
  const [screenSurface, setScreenSurface] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    setCameraStream((current) => {
      stopStream(current);
      return null;
    });
  }, []);

  const stopScreenShare = useCallback(() => {
    setScreenStream((current) => {
      stopStream(current);
      return null;
    });
    setScreenSurface(null);
  }, []);

  const stopAll = useCallback(() => {
    stopCamera();
    stopScreenShare();
  }, [stopCamera, stopScreenShare]);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("This browser does not support camera capture.");
      return;
    }

    setCameraPending(true);
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      stopCamera();

      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          setCameraStream((current) => (current === stream ? null : current));
        };
      });

      setCameraStream(stream);
    } catch (error) {
      setCameraError(getMediaErrorMessage(error, "camera"));
    } finally {
      setCameraPending(false);
    }
  }, [stopCamera]);

  const startScreenShare = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setScreenError("This browser does not support screen sharing.");
      return;
    }

    setScreenPending(true);
    setScreenError(null);
    setScreenSurface(null);

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { ideal: 12, max: 15 },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      stopScreenShare();

      const videoTrack = stream.getVideoTracks()[0];
      const displaySurface = videoTrack?.getSettings().displaySurface;

      if (!displaySurface || displaySurface !== "monitor") {
        stopStream(stream);
        setScreenError(
          "You must share your entire screen to continue this interview. Re-open screen sharing and choose Entire Screen.",
        );
        return;
      }

      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          setScreenStream((current) => (current === stream ? null : current));
          setScreenSurface(null);
        };
      });

      setScreenSurface(displaySurface);
      setScreenStream(stream);
    } catch (error) {
      setScreenError(getMediaErrorMessage(error, "screen"));
    } finally {
      setScreenPending(false);
    }
  }, [stopScreenShare]);

  useEffect(() => {
    return () => {
      stopAll();
    };
  }, [stopAll]);

  return {
    cameraStream,
    screenStream,
    cameraError,
    screenError,
    screenSurface,
    cameraPending,
    screenPending,
    cameraActive: Boolean(cameraStream),
    screenActive: Boolean(screenStream),
    screenVerified: screenSurface === "monitor" && Boolean(screenStream),
    startCamera,
    stopCamera,
    startScreenShare,
    stopScreenShare,
    stopAll,
  };
};
