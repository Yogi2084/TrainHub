import { create } from "zustand";

interface RefreshState {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export const useRefreshStore = create<RefreshState>((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () =>
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));
