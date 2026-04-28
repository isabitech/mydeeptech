import { useEffect, useMemo, useState } from "react";

const formatRemaining = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const useInterviewTimer = (
  startedAt: string,
  durationMinutes: number,
  enabled = true,
) => {
  const endTime = useMemo(() => {
    return new Date(startedAt).getTime() + durationMinutes * 60 * 1000;
  }, [durationMinutes, startedAt]);

  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    if (!enabled) {
      return durationMinutes * 60;
    }
    return Math.max(0, Math.floor((endTime - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!enabled) {
      setRemainingSeconds(durationMinutes * 60);
      return;
    }

    setRemainingSeconds(Math.max(0, Math.floor((endTime - Date.now()) / 1000)));

    const intervalId = window.setInterval(() => {
      setRemainingSeconds(Math.max(0, Math.floor((endTime - Date.now()) / 1000)));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [durationMinutes, enabled, endTime]);

  return {
    remainingSeconds,
    remainingLabel: formatRemaining(remainingSeconds),
    isExpired: remainingSeconds <= 0,
  };
};
