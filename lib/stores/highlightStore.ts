import { create } from "zustand";

interface HighlightState {
  highlightId: string | null;
  setHighlightId: (id: string) => void;
  clearHighlightId: () => void;
}

export const useHighlightStore = create<HighlightState>((set) => ({
  highlightId: null,
  setHighlightId: (id) => set({ highlightId: id }),
  clearHighlightId: () => set({ highlightId: null }),
}));
