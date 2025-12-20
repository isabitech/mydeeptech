import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

interface VideoSeekBarProps {
  value: number; // normalized 0-1
  abRepeatActive?: boolean;
  abStart?: number; // normalized 0-1
  abEnd?: number; // normalized 0-1
  onChange: (value: number) => void;
  onAfterChange?: (value: number) => void;
  onExitABRepeat?: () => void;
  className?: string;
}

const VideoSeekBar: React.FC<VideoSeekBarProps> = ({
  value,
  abRepeatActive = false,
  abStart = 0,
  abEnd = 1,
  onChange,
  onAfterChange,
  onExitABRepeat,
  className = "w-full",
}) => {
  // Clamp value to A-B segment if active
  const sliderValue = abRepeatActive
    ? Math.max(abStart, Math.min(value, abEnd))
    : value;

  // Always allow full range, but restrict handle movement
  const min = 0;
  const max = 1;

  // Custom handle style
  const handleStyle = {
    borderColor: abRepeatActive ? "#00bfff" : "#04716A",
    backgroundColor: abRepeatActive ? "#fff" : "#04716A",
    height: 12,
    width: 12,
    marginTop: -3,
    opacity: 1,
  };

  // Custom rail: always full width, dimmed
  const railStyle = abRepeatActive
    ? {
        background: `linear-gradient(to right, #888 0%, #888 ${abStart * 100}%, #aeefff ${abStart * 100}%, #aeefff ${abEnd * 100}%, #888 ${abEnd * 100}%, #888 100%)`,
        opacity: 1,
        height: 6,
      }
    : {
        background: "white",
        height: 6,
      };

  // Custom track: only highlight the played part within the A-B segment
  const trackStyle = abRepeatActive
    ? [
        {
          background: `linear-gradient(to right, transparent 0%, transparent ${abStart * 100}%, #aeefff ${abStart * 100}%, #aeefff ${abEnd * 100}%, transparent ${abEnd * 100}%, transparent 100%)`,
          height: 6,
        },
      ]
    : [
        {
          background: "transparent",
          height: 6,
        },
      ];

  // Prevent handle from moving outside A-B segment
  const handleMove = (val: number) => {
    if (abRepeatActive) {
      if (val < abStart) return abStart;
      if (val > abEnd) return abEnd;
    }
    return val;
  };

  return (
    <div className={className} style={{ position: "relative", height: 18 }}>
      {/* Green progress bar for normal mode */}
      {!abRepeatActive && (
        <div
          style={{
            position: "absolute",
            left: -0.5,
            top: 5,
            height: 6,
            width: `${Math.max(0, Math.min(1, value)) * 100}%`,
            background: "#023835",
            borderRadius: 3,
            zIndex: 1,
            pointerEvents: "none",
            transition: "width 0.1s linear",
          }}
        />
      )}
      {/* Slider always on top */}
      <Slider
        min={min}
        max={max}
        step={0.000001}
        value={sliderValue}
        onChange={(val: number | number[]) => {
          let v = Array.isArray(val) ? val[0] : val;
          v = handleMove(v);
          onChange(v);
        }}
        onAfterChange={onAfterChange ? (val: number | number[]) => {
          let v = Array.isArray(val) ? val[0] : val;
          v = handleMove(v);
          onAfterChange(v);
        } : undefined}
        trackStyle={trackStyle}
        railStyle={railStyle}
        handleStyle={{ ...handleStyle, borderWidth: 2 }}
        disabled={false}
        included={false}
      />
      {abRepeatActive && onExitABRepeat && (
        <button
          style={{ position: "absolute", left: 0, top: -60, zIndex: 2 }}
          onClick={onExitABRepeat}
          className="text-xs bg-white border opacity-45 hover:opacity-100 transition-all duration-300 rounded px-2 py-1 shadow dark:bg-cardDark"
        >
          Exit Loop
        </button>
      )}
    </div>
  );
};

export default VideoSeekBar; 