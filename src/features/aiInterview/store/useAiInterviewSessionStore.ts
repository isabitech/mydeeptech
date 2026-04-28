import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AiInterviewSessionUiState = {
  preferredLanguage: string;
  autoReadQuestions: boolean;
  drafts: Record<string, string>;
};

type AiInterviewSessionUiActions = {
  setPreferredLanguage: (languageCode: string) => void;
  toggleAutoReadQuestions: () => void;
  setDraft: (sessionId: string, draft: string) => void;
  clearDraft: (sessionId: string) => void;
};

type AiInterviewSessionUiStore = AiInterviewSessionUiState & AiInterviewSessionUiActions;

export const useAiInterviewSessionStore = create<AiInterviewSessionUiStore>()(
  persist(
    (set) => ({
      preferredLanguage: "en-US",
      autoReadQuestions: true,
      drafts: {},
      setPreferredLanguage: (languageCode) =>
        set(() => ({ preferredLanguage: languageCode })),
      toggleAutoReadQuestions: () =>
        set((state) => ({ autoReadQuestions: !state.autoReadQuestions })),
      setDraft: (sessionId, draft) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [sessionId]: draft,
          },
        })),
      clearDraft: (sessionId) =>
        set((state) => {
          const nextDrafts = { ...state.drafts };
          delete nextDrafts[sessionId];
          return { drafts: nextDrafts };
        }),
    }),
    {
      name: "ai-interview-ui-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferredLanguage: state.preferredLanguage,
        autoReadQuestions: state.autoReadQuestions,
        drafts: state.drafts,
      }),
    },
  ),
);
