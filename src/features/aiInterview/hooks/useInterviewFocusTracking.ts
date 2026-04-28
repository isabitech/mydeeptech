import { useEffect, useMemo, useRef, useState } from "react";
import type { AiInterviewFocusEvent } from "../types";

const buildStorageKey = (sessionId: string) => `ai-interview-focus-events:${sessionId}`;

const readStoredEvents = (sessionId: string) => {
  if (!sessionId) {
    return [];
  }

  try {
    const raw = sessionStorage.getItem(buildStorageKey(sessionId));
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as AiInterviewFocusEvent[];
  } catch {
    return [];
  }
};

export const clearInterviewFocusEvents = (sessionId: string) => {
  if (!sessionId) {
    return;
  }
  sessionStorage.removeItem(buildStorageKey(sessionId));
};

export const useInterviewFocusTracking = (sessionId: string, enabled: boolean) => {
  const [events, setEvents] = useState<AiInterviewFocusEvent[]>(() => readStoredEvents(sessionId));
  const lastEventTimestampRef = useRef(0);

  useEffect(() => {
    setEvents(readStoredEvents(sessionId));
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    sessionStorage.setItem(buildStorageKey(sessionId), JSON.stringify(events));
  }, [events, sessionId]);

  useEffect(() => {
    if (!enabled || !sessionId) {
      return;
    }

    const pushEvent = (type: AiInterviewFocusEvent["type"], label: string) => {
      const now = Date.now();
      if (now - lastEventTimestampRef.current < 800) {
        return;
      }
      lastEventTimestampRef.current = now;

      setEvents((current) => [
        ...current,
        {
          id: `${type}-${now}`,
          type,
          occurredAt: new Date(now).toISOString(),
          label,
        },
      ]);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        pushEvent("tab-hidden", "Interview tab was hidden or the browser moved to another tab.");
      }
    };

    const handleWindowBlur = () => {
      if (document.visibilityState === "visible") {
        pushEvent("window-blur", "Interview window lost focus.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [enabled, sessionId]);

  const focusLossCount = events.length;
  const latestEvent = useMemo(() => {
    return events.length > 0 ? events[events.length - 1] : null;
  }, [events]);

  return {
    events,
    focusLossCount,
    latestEvent,
  };
};
