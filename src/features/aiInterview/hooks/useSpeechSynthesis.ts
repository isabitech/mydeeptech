import { useCallback, useEffect, useRef, useState } from "react";

type SpeakOptions = {
  lang?: string;
  rate?: number;
  pitch?: number;
};

export const useSpeechSynthesis = () => {
  const [supported, setSupported] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (!supported) {
      return;
    }
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
    setIsPaused(false);
  }, [supported]);

  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      if (!supported || muted || !text.trim()) {
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options?.lang ?? "en-US";
      utterance.rate = options?.rate ?? 1;
      utterance.pitch = options?.pitch ?? 1;
      utterance.onstart = () => {
        setCurrentText(text);
        setIsSpeaking(true);
        setIsPaused(false);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [muted, supported],
  );

  const pause = useCallback(() => {
    if (!supported || !window.speechSynthesis.speaking) {
      return;
    }
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsSpeaking(false);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported || !window.speechSynthesis.paused) {
      return;
    }
    window.speechSynthesis.resume();
    setIsPaused(false);
    setIsSpeaking(true);
  }, [supported]);

  const replay = useCallback(
    (text?: string, options?: SpeakOptions) => {
      const replayText = text ?? currentText;
      if (!replayText) {
        return;
      }
      speak(replayText, options);
    },
    [currentText, speak],
  );

  const toggleMute = useCallback(() => {
    setMuted((previous) => {
      const next = !previous;
      if (next) {
        stop();
      }
      return next;
    });
  }, [stop]);

  return {
    supported,
    muted,
    isSpeaking,
    isPaused,
    currentText,
    speak,
    pause,
    resume,
    stop,
    replay,
    toggleMute,
  };
};
