// lib/stores/authStore.ts
import { create } from "zustand";

interface User {
  name: string;
  email: string;
  image?: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
