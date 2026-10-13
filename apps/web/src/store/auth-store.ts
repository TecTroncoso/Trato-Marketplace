import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiFetch } from "@/lib/api";
import type { User } from "@trato/shared";

interface SessionResponse {
  token: string;
  user: User;
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: { name: string; email: string; password: string; phone?: string }) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      login: async (email, password) => {
        set({ loading: true });
        try {
          const session = await apiFetch<SessionResponse>("/auth/login", {
            method: "POST",
            body: { email, password },
          });
          set({ token: session.token, user: session.user, loading: false });
          return session.user;
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },
      register: async (input) => {
        set({ loading: true });
        try {
          const session = await apiFetch<SessionResponse>("/auth/register", { method: "POST", body: input });
          set({ token: session.token, user: session.user, loading: false });
          return session.user;
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },
      logout: () => set({ token: null, user: null }),
      refresh: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const user = await apiFetch<User>("/auth/me", { token });
          set({ user });
        } catch {
          set({ token: null, user: null });
        }
      },
      setUser: (user) => set({ user }),
    }),
    { name: "trato-auth", partialize: (state) => ({ token: state.token, user: state.user }) },
  ),
);
