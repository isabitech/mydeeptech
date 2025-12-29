import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";

interface VPlayerProps {
  playerRef: React.RefObject<any>;
  url?: string;
  playing?: boolean;
  controls?: boolean;
  light?: boolean;
  volume?: number;
  muted?: boolean;
  played?: number;
  playbackRate?: number;
  loop?: boolean;
  pip?: boolean;
  onReady?: () => void;
  onStart?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onBuffer?: () => void;
  onBufferEnd?: () => void;
  onEnded?: () => void;
  onProgress?: (state: any) => void;
  onError?: (error: any) => void;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
  className?: string;
  [key: string]: any; // Allow additional props
}

const VPlayer: React.FC<VPlayerProps> = ({ playerRef, onReady, ...props }) => {
  const [isClientReady, setIsClientReady] = useState(false);

  // Ensure client-side rendering for ReactPlayer
  useEffect(() => {
    setIsClientReady(true);
  }, []);

  // Enhanced onReady handler that ensures proper initialization
  const handleReady = () => {
    console.log("🎬 VPlayer - ReactPlayer ready, player ref available");
    if (onReady) {
      // Small delay to ensure player is fully initialized
      setTimeout(() => {
        onReady();
      }, 100);
    }
  };

  if (!isClientReady) {
    return (
      <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-white">
        Loading player...
      </div>
    );
  }

  return (
    <ReactPlayer url={props.url} ref={playerRef} onReady={handleReady} {...props} />
  );
};

export default VPlayer;
