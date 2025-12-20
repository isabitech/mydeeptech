/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  type ChangeEvent,
  useEffect,
  useRef,
  useState,
  useCallback,
  type MouseEvent,
  lazy,
  Suspense,
} from "react";
import ReactPlayer from "react-player";
import { cn, formatVideoUrl, getYouTubeId } from "../../lib/utils";
import {
  Forward,
  Fullscreen,
  Minimize2,
  PauseIcon,
  Play,
  PlayIcon,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeOff,
} from "lucide-react";
// import AiModerator from "./ai-moderator";
// import VideoSeekBar from "./video-seek-bar";
import {
  
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
// import { lockOrientation, unlockOrientation } from 'react-screen-orientation';
import { environ, mixpanel } from "../../utils/mixpanel-config";
import VideoSeekBar from "./VideoSeekBar";

// Lazy load VPlayer component to avoid ReactPlayer ref issues
const VPlayer = lazy(() => import("./VPlayer"));

const USER_ID = "userid"
// Utility to lock orientation
async function lockOrientation(orientation: "landscape" | "portrait") {
  if (
    isMobileDevice() &&
    screen.orientation &&
    (screen.orientation as any).lock
  ) {
    try {
      // @ts-expect-error: Property 'lock' does exist on some browsers
      await screen.orientation.lock(orientation);
    } catch (e) {
      // Some browsers may not support or allow this
      // console.warn('Orientation lock failed:', e);
    }
  }
}

// Utility to unlock orientation (set to portrait)
async function unlockOrientation() {
  if (
    isMobileDevice() &&
    screen.orientation &&
    (screen.orientation as any).lock
  ) {
    try {
      // @ts-expect-error: Property 'lock' does exist on some browsers
      await screen.orientation.lock("portrait");
    } catch (e) {
      // console.warn('Orientation unlock failed:', e);
    }
  }
}

// Helper function to create a unique hash for video segment
const createVideoHash = (src: string, startTime: string, endTime: string) => {
  return btoa(`${src}-${startTime}-${endTime}`);
};

// Utility to detect mobile devices
function isMobileDevice() {
  return (
    typeof window !== "undefined" &&
    /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  );
}

const VideoPlayer = ({
  className,
  src,
  openMod,
  isModOpen,
  videoTime,
  data,
  setData,
  videoId,
  customSettings,
  handleCompleted,
  seekTime,
  autoPlay = false,
  playing = false
}: {
  className?: string;
  isModOpen: boolean;
  data?: any;
  setData?: (data: any) => void;
  videoId: number;
  src: string;
  openMod: (state: boolean) => void;
  autoPlay?: boolean;
  videoTime: {
    startTime: string;
    endTime: string;
  };
  playing?: boolean;
  handleCompleted?: () => void;
  customSettings?: object;
  seekTime?: string; // can be in form of minutes hours seconds like 02:15:18
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const abStartTime = searchParams.get("start_time");
  const abEndTime = searchParams.get("end_time");
  const r_progress = searchParams.get("r_progress");
  const navigate = useNavigate();
  const { id: sessionId } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [videoState, setVideoState] = useState({
    url: formatVideoUrl(src),
    pip: false,
    playing: autoPlay, // Use autoPlay prop to determine initial playing state
    controls: false, // Enable controls to help with debugging
    light: false, // Disable light mode for now
    volume: 0.8,
    muted: false, // Unmute to allow playback
    played: 0,
    // loaded: 0,
    // duration: 0,
    playbackRate: 1.0,
    loop: false,
    ...customSettings,
  });

  const first_name = "Test";
  const last_name = "User";
  const email = "test.user@example.com";

  const youtubeId = getYouTubeId(src);
  const thumbnailUrl = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : "fallback-thumbnail.jpg";

  const [progressId, setProgressId] = useState<number | null>(null);
  const [refreshVid, setRefreshVid] = useState(true);
  const [seeking, setSeeking] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<any>(null);
  const [progressTimestamp, setProgressTimestamp] = useState<string | null>(
    null
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [timeConstraints, setTimeConstraints] = useState({
    startSeconds: 0,
    endSeconds: 0,
  });

  const [videoDuration, setVideoDuration] = useState(0);

  // Debug logging
  console.log("🎥 VideoPlayer - Props received:", {
    videoId,
    src,
    videoTime,
    USER_ID,
    seekTime: seekTime || "not provided",
  });

  // Mock video time query for development
  const videoTimeQuery = {
    data: { 
      results: [] 
    },
    isSuccess: true,
    isLoading: false,
  };

  // Mock POST operations for testing
  const mockPostOperations = {
    mutate: (data: any) => {
      console.log("Mock POST operation called with:", data);
      // Simulate successful operation
      if (data.video && data.profile && data.timestamp) {
        console.log("Mock: Created video progress");
      } else if (data.id && data.timestamp) {
        console.log("Mock: Updated video progress");
      }
    },
  };

  const onCreateVideoProgress = mockPostOperations;
  const onUpdateVideoProgress = mockPostOperations;

  const hasCompletedRef = useRef(false);

  const aiModRef = useRef<any>(null);

  // --- A-B Repeat State ---
  const [abRepeatActive, setAbRepeatActive] = useState(false);
  const [abStart, setAbStart] = useState(0); // seconds
  const [abEnd, setAbEnd] = useState(0); // seconds
  const [abRepeat, setAbRepeat] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [pausedByRaiseHand, setPausedByRaiseHand] = useState(false);

  // Debug logging for mock data - moved after all state declarations
  // console.log("🎥 VideoPlayer - USE_MOCK_DATA:", USE_MOCK_DATA);
  // console.log("🎥 VideoPlayer - Mock query result:", videoTimeQuery);
  // console.log(
  //   "🎥 VideoPlayer - Has videoId and USER_ID:",
  //   !!videoId && !!USER_ID
  // );
  // console.log("🎥 VideoPlayer - Video state:", videoState);
  // console.log("🎥 VideoPlayer - isReady:", isReady);
  // console.log("🎥 VideoPlayer - hasPlayedOnce:", hasPlayedOnce);

  // // Safe wrapper for seekTo to prevent errors
  const safeSeekTo = useCallback(
    (time: number, type: "seconds" | "fraction" = "seconds") => {
      if (
        playerRef.current &&
        isReady &&
        typeof playerRef.current.seekTo === "function"
      ) {
        try {
          playerRef.current.seekTo(time, type);
          return true;
        } catch (error) {
          console.warn("🎬 Failed to seek:", error);
          return false;
        }
      } else {
        console.warn('🎬 Cannot seek - player not ready or seekTo function not available');
        return false;
      }
    },
    [isReady]
  );

  // Safe wrapper for getCurrentTime to prevent errors
  const safeGetCurrentTime = useCallback(() => {
    console.log('🎬 safeGetCurrentTime called');
    console.log('🎬 playerRef.current:', !!playerRef.current);
    console.log('🎬 isReady:', isReady);
    console.log('🎬 getCurrentTime function exists:', playerRef.current && typeof playerRef.current.getCurrentTime === 'function');
    
    if (playerRef.current && isReady && typeof playerRef.current.getCurrentTime === 'function') {
      try {
        const currentTime = playerRef.current.getCurrentTime() || 0;
        console.log('🎬 getCurrentTime returned:', currentTime);
        return currentTime;
      } catch (error) {
        console.warn('Failed to get current time:', error);
        return 0;
      }
    } else {
      console.warn('🎬 Cannot get current time - player not ready or getCurrentTime function not available');
      return 0;
    }
  }, [isReady]);

  // Handle native fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      console.log("🔲 handleFullscreenChange triggered:", {
        isCurrentlyFullscreen,
        previousIsNativeFullscreen: isNativeFullscreen,
        isModOpen,
        fullscreenElement: document.fullscreenElement ? 'exists' : 'null'
      });
      
      setIsNativeFullscreen(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen && isModOpen) {
        console.log("🔲 User exited fullscreen via browser controls, calling openMod(false)");
        // User exited fullscreen via browser controls, update our state
        openMod(false);
        // Return to portrait on mobile when exiting fullscreen
        if (isMobileDevice()) {
          unlockOrientation();
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isModOpen, openMod, isNativeFullscreen]);

  // Toggle fullscreen function
  const toggleFullscreen = async () => {
    console.log("🔲 toggleFullscreen called, current states:", {
      isNativeFullscreen,
      isModOpen,
      containerRefExists: !!containerRef.current,
      documentFullscreenElement: !!document.fullscreenElement
    });
    
    if (!containerRef.current) {
      console.warn("🔲 Cannot toggle fullscreen - no container ref");
      return;
    }

    try {
      if (!isNativeFullscreen) {
        console.log("🔲 Entering fullscreen...");
        // Lock orientation to landscape BEFORE entering fullscreen on mobile
        if (isMobileDevice()) {
          try {
            await lockOrientation("landscape");
            // Add a small delay to ensure orientation change
            await new Promise((resolve) => setTimeout(resolve, 200));
          } catch (e) {
            console.warn("Orientation lock failed:", e);
          }
        }

        // Enter fullscreen
        await containerRef.current.requestFullscreen();
        console.log("🔲 Fullscreen requested, calling openMod(true)");
        openMod(true);
      } else {
        console.log("🔲 Exiting fullscreen...");
        // Exit fullscreen
        await document.exitFullscreen();
        console.log("🔲 Fullscreen exited, calling openMod(false)");
        openMod(false);
        // Return to portrait on mobile
        if (isMobileDevice()) {
          try {
            await unlockOrientation();
          } catch (e) {
            console.warn("Orientation unlock failed:", e);
          }
        }
      }
    } catch (error) {
      console.error("🔲 Fullscreen toggle failed:", error);
      // Fallback to prop-based fullscreen if API fails
      console.log("🔲 Using fallback, calling openMod with:", !isModOpen);
      openMod(!isModOpen);
    }
  };

  // Handle orientation when fullscreen state changes
  useEffect(() => {
    if (isModOpen && isMobileDevice()) {
      // Ensure landscape orientation when entering fullscreen
      lockOrientation("landscape").catch((e) => {
        console.warn("Failed to lock orientation to landscape:", e);
      });
    } else if (!isModOpen && isMobileDevice()) {
      // Return to portrait when exiting fullscreen
      unlockOrientation().catch((e) => {
        console.warn("Failed to unlock orientation:", e);
      });
    }
  }, [isModOpen]);

  useEffect(() => {
    console.log(`🎬 VideoPlayer: Video setup effect - videoId: ${videoId}, profile id: ${USER_ID}`);
    if (!videoId || !USER_ID) return;
    console.log('🎬 VideoPlayer: Setup effect running');
    
    if (r_progress) {
      setProgressId(null);
      setProgressTimestamp(r_progress);
      console.log('🎬 VideoPlayer: Using r_progress:', r_progress);
    } else {
      // For mock data, just start with no progress
      console.log('🎬 VideoPlayer: Using mock data - no progress tracking');
      setProgressId(null);
      setProgressTimestamp(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, USER_ID, r_progress]);

  // Seek to saved progress timestamp if available (only if no seekTime prop is provided)
  useEffect(() => {
    // If seekTime prop is provided, prioritize it over API progress
    if (seekTime) {
      console.log("🎬 Skipping API progress seek - seekTime prop takes priority");
      return;
    }
    
    // Early return if we don't have the essential data yet
    if (
      !progressTimestamp ||
      !isReady ||
      !videoTime.startTime ||
      !videoTime.endTime ||
      !playerRef.current
    ) {
      return;
    }
    
    console.log("🎬 Seeking to found progress timestamp:", progressTimestamp);
    
    const savedTime = timeToSeconds(progressTimestamp);
    // Clamp to allowed range
    const seekTimeSeconds = Math.max(
      timeConstraints.startSeconds,
      Math.min(savedTime, timeConstraints.endSeconds)
    );
    
    console.log("🎬 Seeking to clamped time:", seekTimeSeconds, "seconds");
    safeSeekTo(seekTimeSeconds);

    // Clean up r_progress URL parameter if it exists
    if (r_progress) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("r_progress");
      setSearchParams(newParams, { replace: true });
    }
  }, [
    progressTimestamp,
    isReady,
    timeConstraints.startSeconds,
    timeConstraints.endSeconds,
    videoTime.startTime,
    videoTime.endTime,
    safeSeekTo,
    r_progress,
    searchParams,
    setSearchParams,
    seekTime, // Add seekTime as dependency to re-evaluate when it changes
  ]);

  // Helper function to save video progress
  const saveCurrentProgress = useCallback(() => {
    if (!USER_ID || !videoId || !playerRef.current || !isReady) {
      console.log('🚫 Cannot save progress - missing requirements:', {
        hasUserId: !!USER_ID,
        hasVideoId: !!videoId,
        hasPlayerRef: !!playerRef.current,
        isReady
      });
      return;
    }

    const current = safeGetCurrentTime();
    
    // Only save if current time is within allowed range
    if (
      current >= timeConstraints.startSeconds &&
      current <= timeConstraints.endSeconds
    ) {
      // Convert current to HH:MM:SS
      const hours = Math.floor(current / 3600);
      const minutes = Math.floor((current % 3600) / 60);
      const seconds = Math.floor(current % 60);
      const pad = (n: number) => n.toString().padStart(2, "0");
      const timestamp = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

      console.log('💾 Saving video progress:', {
        current,
        timestamp,
        videoId,
        profile: USER_ID
      });

      onUpdateVideoProgress.mutate({
        profile: USER_ID,
        video: videoId,
        timestamp: timestamp,
      });
    } else {
      console.log('🚫 Current time outside allowed range, not saving progress');
    }
  }, [
    videoId,
    isReady,
    safeGetCurrentTime,
    timeConstraints.startSeconds,
    timeConstraints.endSeconds,
    onUpdateVideoProgress,
  ]);

  // Set up interval to update video progress every 5 seconds
  useEffect(() => {
    console.log('🔄 VideoPlayer: Video progress useEffect triggered with:', {
      userProfileId: USER_ID,
      videoId,
      playerRefCurrent: !!playerRef.current,
    });

    if (!USER_ID) {
      console.log('❌ VideoPlayer: Early return - No user profile_id');
      return;
    }
    if (!videoId) {
      console.log('❌ VideoPlayer: Early return - No videoId');
      return;
    }
    if (!playerRef.current) {
      console.log('❌ VideoPlayer: Early return - No playerRef.current');
      return;
    }

    console.log('✅ VideoPlayer: All conditions met, setting up interval');

    // Clear any previous interval
    if (intervalRef.current) {
      console.log('🧹 VideoPlayer: Clearing previous interval');
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      console.log('⏰ VideoPlayer: Interval callback triggered');

      // Only save progress if video is playing
      if (!videoState.playing) {
        console.log('⏸️ VideoPlayer: Video not playing, skipping progress update');
        return;
      }

      // Use the helper function to save progress
      saveCurrentProgress();
    }, 5000);

    return () => {
      console.log('🧹 VideoPlayer: Cleanup - Clearing interval');
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    videoId,
    timeConstraints.startSeconds,
    timeConstraints.endSeconds,
    videoState.playing,
    saveCurrentProgress,
  ]);

  // Save progress when component unmounts (user exits/navigates away)
  useEffect(() => {
    return () => {
      console.log('🚪 VideoPlayer: Component unmounting - saving final progress');
      saveCurrentProgress();
    };
  }, [saveCurrentProgress]);

  const videoHash = createVideoHash(
    src,
    videoTime.startTime,
    videoTime.endTime
  );

  const [currentTime, setCurrentTime] = useState("00:00");
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);

  const timeToSeconds = (timeString: string) => {
    // Split the time string into parts
    const parts = timeString.split(":").map(Number);

    // Handle both HH:MM:SS and MM:SS formats
    if (parts.length === 3) {
      // HH:MM:SS format
      const [hours, minutes, seconds] = parts;
      return hours * 3600 + minutes * 60 + seconds;
    } else {
      // MM:SS format
      const [minutes, seconds] = parts;
      return minutes * 60 + seconds;
    }
  };

  useEffect(() => {
    if (videoTime.startTime && videoTime.endTime) {
      const startSeconds = timeToSeconds(videoTime?.startTime);
      const endSeconds = timeToSeconds(videoTime?.endTime);
      setTimeConstraints({ startSeconds, endSeconds });

      // Only seek if player is ready and available
      if (isReady && playerRef.current) {
        console.log('🎬 Seeking to start time:', startSeconds, 'seconds');
        if (safeSeekTo(startSeconds)) {
          setVideoState((prev) => ({
            ...prev,
            played: 0,
          }));
        }
      } else {
        console.log('🎬 Skipping initial seek - player not ready yet');
      }
    }
  }, [videoTime?.startTime, videoTime?.endTime, isReady, safeSeekTo]);

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newPlayed = parseFloat(e.target.value);
    const availableDuration =
      timeConstraints.endSeconds - timeConstraints.startSeconds;
    const adjustedTime =
      availableDuration * newPlayed + timeConstraints.startSeconds;

    // Calculate relative progress based on adjusted time
    const relativeProgress =
      (adjustedTime - timeConstraints.startSeconds) /
      (timeConstraints.endSeconds - timeConstraints.startSeconds);

    setVideoState((prev) => ({ ...prev, played: relativeProgress }));
  };

  const handleSeekMouseUp = (e: any) => {
    setSeeking(false);
    const newPlayed = parseFloat(e.target.value);
    const availableDuration =
      timeConstraints.endSeconds - timeConstraints.startSeconds;
    const adjustedTime =
      availableDuration * newPlayed + timeConstraints.startSeconds;

    // Seek to the adjusted time
    safeSeekTo(adjustedTime);

    const relativeProgress =
      (adjustedTime - timeConstraints.startSeconds) /
      (timeConstraints.endSeconds - timeConstraints.startSeconds);

    setVideoState((prev) => ({ ...prev, played: relativeProgress }));
  };

  const seekForward = useCallback(() => {
    console.log('🎬 Seek Forward clicked');
    console.log('🎬 Player ready state:', isReady);
    console.log('🎬 Player ref exists:', !!playerRef.current);
    
    if (!isReady) {
      console.warn('🎬 Cannot seek forward - player not ready yet');
      return;
    }
    
    const currentTime = safeGetCurrentTime();
    console.log('🎬 Current time:', currentTime);
    const newTime = Math.min(currentTime + 15, timeConstraints.endSeconds);
    console.log('🎬 Seeking to:', newTime);
    safeSeekTo(newTime);
  }, [isReady, safeGetCurrentTime, timeConstraints.endSeconds, safeSeekTo]);

  const seekBackward = useCallback(() => {
    console.log('🎬 Seek Backward clicked');
    console.log('🎬 Player ready state:', isReady);
    console.log('🎬 Player ref exists:', !!playerRef.current);
    
    if (!isReady) {
      console.warn('🎬 Cannot seek backward - player not ready yet');
      return;
    }
    
    const currentTime = safeGetCurrentTime();
    console.log('🎬 Current time:', currentTime);
    const newTime = Math.max(currentTime - 15, timeConstraints.startSeconds);
    console.log('🎬 Seeking to:', newTime);
    safeSeekTo(newTime);
  }, [isReady, safeGetCurrentTime, timeConstraints.startSeconds, safeSeekTo]);

  useEffect(() => {
    if (src) {
      setVideoState((prev) => ({
        ...prev,
        url: formatVideoUrl(src),
        played: 0,
        playing: false,
      }));

      setRefreshVid(false);
      setTimeout(() => setRefreshVid(true), 300);
    }
  }, [src]);

  useEffect(() => {
    if (seekTime && isReady && playerRef.current) {
      console.log("🎬 Processing seekTime prop:", seekTime);
      
      const parts = seekTime.split(":").map(Number).reverse();
      const seconds = parts[0] || 0;
      const minutes = parts[1] || 0;
      const hours = parts[2] || 0;
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;

      // Clamp to allowed range
      const clampedSeconds = Math.max(
        timeConstraints.startSeconds,
        Math.min(totalSeconds, timeConstraints.endSeconds)
      );

      console.log("🎬 Seeking to seekTime prop:", clampedSeconds, "seconds (from", seekTime, ")");
      safeSeekTo(clampedSeconds);
    } else if (seekTime && !isReady) {
      console.log("🎬 seekTime provided but player not ready yet, will seek when ready");
    } else if (seekTime && !playerRef.current) {
      console.log("🎬 seekTime provided but player ref not available");
    }
  }, [seekTime, safeSeekTo, isReady, timeConstraints.startSeconds, timeConstraints.endSeconds]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Format time for display - shows relative time starting from 00:00
  const formatDisplayTime = (currentSeconds: number) => {
    // Calculate relative time by subtracting the start time
    const relativeSeconds = Math.max(0, currentSeconds - timeConstraints.startSeconds);
    return formatTime(relativeSeconds);
  };

  // Trigger A-B repeat with start/end in seconds and repeat boolean
  const triggerABRepeat = useCallback(
    (start: number, end: number, repeat: boolean) => {
      setAbStart(start);
      setAbEnd(end);
      setAbRepeat(repeat);
      setAbRepeatActive(true);
      // Seek to start of segment
      safeSeekTo(start);
      setVideoState((prev) => ({
        ...prev,
        played:
          (start - timeConstraints.startSeconds) /
          (timeConstraints.endSeconds - timeConstraints.startSeconds),
      }));
    },
    [safeSeekTo, timeConstraints.startSeconds, timeConstraints.endSeconds]
  );

  // Exit A-B repeat
  const exitABRepeat = () => {
    setAbRepeatActive(false);
    setAbRepeat(false);
    // Remove start_time and end_time from the URL
    const newParams = new URLSearchParams(searchParams);
    const r_lesson = searchParams.get("r_lesson");
    const r_module = searchParams.get("r_module");
    const r_type = searchParams.get("r_type");
    const r_progress = searchParams.get("r_progress");
    navigate(
      `/p/${sessionId}/module/${r_module}/${r_type}?lid=${r_lesson}&r_progress=${r_progress}`
    );
  };

  // --- Update handleProgress for A-B repeat logic ---
  const handleProgress = () => {
    if (!seeking) {
      let currentTime = safeGetCurrentTime();
      currentTime = Math.round(currentTime);
      
      // Store actual current time in seconds for calculations
      setCurrentTimeSeconds(currentTime);
      
      // Set display time as relative time starting from 00:00
      setCurrentTime(formatDisplayTime(currentTime));

      // Clamp to allowed range
      if (currentTime < timeConstraints.startSeconds) {
        playerRef.current?.seekTo(timeConstraints.startSeconds, "seconds");
        return;
      }
      if (abRepeatActive) {
        if (currentTime < abStart) {
          playerRef.current?.seekTo(abStart, "seconds");
          return;
        }
        if (currentTime >= abEnd) {
          if (abRepeat) {
            playerRef.current?.seekTo(abStart, "seconds");
            setVideoState((prev) => ({
              ...prev,
              played:
                (abStart - timeConstraints.startSeconds) /
                (timeConstraints.endSeconds - timeConstraints.startSeconds),
            }));
            return;
          } else {
            exitABRepeat();
          }
        }
      } else if (
        currentTime >= timeConstraints.endSeconds ||
        (Math.abs(currentTime - videoDuration) <= 2 && videoDuration > 0)
      ) {
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          setVideoState((prev) => ({ ...prev, playing: false })); // Pause the video
          
          // Save progress when video completes
          console.log("🏁 Video completed - saving final progress");
          saveCurrentProgress();
          
          if (handleCompleted) {
            handleCompleted();
          }
        }
        return;
      }
      const relativeProgress =
        (currentTime - timeConstraints.startSeconds) /
        (timeConstraints.endSeconds - timeConstraints.startSeconds);
      setVideoState((prev) => ({ ...prev, played: relativeProgress }));
    }
  };

  // --- SeekBar Handlers for rc-slider ---
  const handleSeekBarChange = (val: number) => {
    // val is normalized 0-1 within allowed range
    const availableDuration =
      timeConstraints.endSeconds - timeConstraints.startSeconds;
    let seekSeconds = val * availableDuration + timeConstraints.startSeconds;
    // If A-B repeat is active, clamp to segment
    if (abRepeatActive) {
      seekSeconds = Math.max(abStart, Math.min(seekSeconds, abEnd));
    }
    safeSeekTo(seekSeconds);
    setVideoState((prev) => ({
      ...prev,
      played: (seekSeconds - timeConstraints.startSeconds) / availableDuration,
    }));
  };

  // --- Calculate normalized values for seek bar ---
  const played = videoState.played;
  const abStartNorm = abRepeatActive
    ? (abStart - timeConstraints.startSeconds) /
      (timeConstraints.endSeconds - timeConstraints.startSeconds)
    : 0;
  const abEndNorm = abRepeatActive
    ? (abEnd - timeConstraints.startSeconds) /
      (timeConstraints.endSeconds - timeConstraints.startSeconds)
    : 1;

  // Update the AB repeat effect to handle loading state
  useEffect(() => {
    if (abStartTime && abEndTime && isReady) {
      const startSeconds = timeToSeconds(abStartTime);
      const endSeconds = timeToSeconds(abEndTime);

      //console.log('startSeconds', startSeconds);
      //console.log('endSeconds', endSeconds);

      // Validate times are within video constraints
      if (
        startSeconds >= timeConstraints.startSeconds &&
        endSeconds <= timeConstraints.endSeconds &&
        startSeconds < endSeconds
      ) {
        //console.log('triggering AB repeat');
        triggerABRepeat(startSeconds, endSeconds, true);
        // Seek to start time
        playerRef.current?.seekTo(startSeconds, "seconds");
        // Set autoplay
        setIsPlaying(true);
      }
    }
  }, [
    abStartTime,
    abEndTime,
    isReady,
    timeConstraints.startSeconds,
    timeConstraints.endSeconds,
    triggerABRepeat,
  ]);

  // Add effect to handle video loading
  useEffect(() => {
    if (isReady) {
      if (abStartTime && abEndTime) {
        setTimeout(() => {
          setIsPlaying(true);
        }, 500);
      }
    }
  }, [isReady, abStartTime, abEndTime]);

  const handleReady = () => {
    console.log("🎬 ReactPlayer onReady triggered");
    console.log("🎬 PlayerRef available methods:", playerRef.current ? Object.getOwnPropertyNames(playerRef.current).filter(name => typeof playerRef.current[name] === 'function') : 'playerRef is null');
    setIsReady(true);
    console.log("🎬 isReady set to true");

    // Get actual video duration and adjust end time if needed
    const duration = playerRef.current?.getDuration();
    console.log("🎬 Video duration:", duration);
    setVideoDuration(duration || 0);
    if (duration && timeConstraints.endSeconds > duration) {
      //console.log(`Video end time adjusted: ${timeConstraints.endSeconds}s → ${duration}s (actual video duration)`);
      setTimeConstraints((prev) => ({
        ...prev,
        endSeconds: duration,
      }));
    }

    // If we have AB repeat timestamps, set up the repeat and start playing
    if (abStartTime && abEndTime) {
      const startSeconds = timeToSeconds(abStartTime);
      const endSeconds = timeToSeconds(abEndTime);

      // Validate times are within video constraints
      if (
        startSeconds >= timeConstraints.startSeconds &&
        endSeconds <= timeConstraints.endSeconds &&
        startSeconds < endSeconds
      ) {
        // Set up AB repeat
        triggerABRepeat(startSeconds, endSeconds, true);

        // Seek to start time
        playerRef.current?.seekTo(startSeconds, "seconds");

        // Click the video element after a delay to trigger playback
        setTimeout(() => {
          const videoElement = document.querySelector(
            ".html5-video-player"
          ) as HTMLVideoElement;
          if (videoElement) {
            videoElement.click();
            //console.log('clicked');
          }
        }, 1000);
      }
    }
  };

  const handleInitialPlay = () => {
    console.log("🎬 handleInitialPlay called!");
    console.log("🎬 Current video state before play:", videoState);
    setHasPlayedOnce(true);
    setVideoState((prev) => {
      const newState = { ...prev, playing: true };
      console.log("🎬 Setting new video state:", newState);
      return newState;
    });

    // implicitly return if we're in the development environment
    if (environ === "development") {
      console.log("🎬 In development mode - skipping mixpanel tracking");
      return;
    }

    // event logger
    mixpanel.identify(email);

    mixpanel.track("Watch Video", {
      email: email,
      first_name: first_name,
      last_name: last_name,
      video_id: videoId,
      video_url: src,
      timestamp: new Date().toISOString(),
      action: "play",
      source: "VideoPlayer",
    });
  };

  // Function to pause video when raise hand is clicked
  const handleRaiseHand = () => {
    setPausedByRaiseHand(true);
    setVideoState((prev) => ({ ...prev, playing: false }));
  };

  if (!refreshVid) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        `relative bg-black overflow-hidden z-[90]`,
        isNativeFullscreen ? "fixed inset-0 z-[9999]" : "",
        className ?? ""
      )}
    >
      <Suspense fallback={<div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-white">Loading player...</div>}>
        <VPlayer
          playerRef={playerRef}
          className="top-0 left-0 absolute react-player"
          width="100%"
          height="100%"
          onContextMenu={(e: MouseEvent) => e.preventDefault()} // Disable right-click
          onPause={() => {
            console.log("🎬 ReactPlayer onPause triggered");
            setVideoState((prev) => ({ ...prev, playing: false }));
            
            // Save progress when video is paused
            console.log("⏸️ Video paused - saving current progress");
            saveCurrentProgress();
            
            // Only close moderator UI if pause was not triggered by raise hand
            if (!pausedByRaiseHand) {
              aiModRef.current?.closeModUi();
            }
            // Reset the flag
            setPausedByRaiseHand(false);
          }}
          onPlay={() => {
            console.log("🎬 ReactPlayer onPlay triggered");
            setVideoState((prev) => ({ ...prev, playing: true }));
            aiModRef.current?.closeModUi();
          }}
          onProgress={handleProgress}
          onReady={handleReady}
          {...videoState}
        >
          <track
            src="captions.vtt"
            kind="subtitles"
            srcLang="en"
            label="English"
          />

        </VPlayer>
      </Suspense>      {/* Initial Play Icon Overlay */}
      {isReady && !hasPlayedOnce && !videoState.playing && (
        // <div className="absolute inset-0 flex items-center justify-center z-[999]">
        //   <button
        //     onClick={handleInitialPlay}
        //     className="bg-primary2 opacity-50 rounded-full p-6 hover:bg-opacity-30 transition-all duration-200"
        //   >
        //     <Play size={48} className="text-white ml-1" />
        //   </button>
        // </div>
        <div className="relative h-full bg-black">
          <img
            src={thumbnailUrl}
            alt="Video thumbnail"
            className="h-full object-cover w-full cursor-pointer mx-auto "
            onClick={handleInitialPlay}
            onContextMenu={(e) => e.preventDefault()} // Disable right-click on thumbnail
          />
            <button
              onClick={handleInitialPlay}
              className="absolute inset-0 flex items-center justify-center"
              onContextMenu={(e) => e.preventDefault()} // Disable right-click on play button
            >
              <Play className="text-white w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 2xl:w-56 2xl:h-56" />
            </button>
        </div>
      )}

      <div
        className="absolute w-full -bottom-1 px-4 pb-3 z-20
            bg-gradient-to-b from-transparent to-black "
      >
        {/* <div className="flex items-end justify-between relative">
          <span className="text-white text-sm">{formatTime(Math.max(0, timeToSeconds(currentTime) - timeConstraints.startSeconds))}</span>
          <AiModerator ref={aiModRef} isFullScreen={isModOpen} data={data} setData={setData} onRaiseHand={handleRaiseHand} />
        </div> */}

        <VideoSeekBar
          value={played}
          abRepeatActive={abRepeatActive}
          abStart={abStartNorm}
          abEnd={abEndNorm}
          onChange={handleSeekBarChange}
          onExitABRepeat={exitABRepeat}
          className="w-full"
        />

        <div className="flex justify-between items-center">
          <div className="flex text-white gap-4 items-center">
            <button
              onClick={() => {
                const newPlayingState = !videoState.playing;
                setVideoState({ ...videoState, playing: newPlayingState });

                // Save progress when user manually pauses
                if (!newPlayingState) {
                  console.log("⏸️ User manually paused - saving progress");
                  saveCurrentProgress();
                }

                // implicitly return if we're in the development environment
                if (environ === "development") return;

                // event logger
                mixpanel.identify(email);

                mixpanel.track(
                  newPlayingState ? "Watch Video" : "Pause Video",
                  {
                    email: email,
                    first_name: first_name,
                    last_name: last_name,
                    video_id: videoId,
                    video_url: src,
                    timestamp: new Date().toISOString(),
                    action: newPlayingState ? "play" : "pause",
                    source: "VideoPlayer",
                  }
                );
              }}
            >
              {videoState.playing ? <PauseIcon size={24} /> : <PlayIcon />}
            </button>
            <button onClick={seekBackward} className=" flex gap-3 items-center cursor-pointer">
              <p className="text-xs">-15 s</p>
              <SkipBack />
            </button>
            <button onClick={seekForward} className=" flex gap-3 items-center cursor-pointer">
              <SkipForward /> <p className="text-xs">+15 s</p>
            </button>
            <button
              onClick={() =>
                setVideoState({ ...videoState, muted: !videoState.muted })
              }
            >
              {videoState.muted ? <VolumeOff size={20} /> : <Volume2 />}
            </button>

             {/* Duration Timestamp */}
            <span className="text-white text-sm font-mono">
              {currentTime} / {formatTime(timeConstraints.endSeconds - timeConstraints.startSeconds)}
            </span>
          </div>

          <div className="flex gap-4 items-center text-white">
            <button onClick={toggleFullscreen}>
              {isNativeFullscreen ? <Minimize2 size={20} /> : <Fullscreen />}
            </button>
            {/* <button>
              <Cc />
            </button>
            <button>
              <SettingsVid />
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
