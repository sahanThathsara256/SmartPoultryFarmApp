import {create} from 'zustand';
import {loadItem, saveItem, STORAGE_KEYS} from '@utils/storage';

interface AuthUser {
  email: string;
}

type AuthStore = {
  user: AuthUser | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>(
  (set, get) => ({
    user: null,
    initializing: true,
    async hydrate() {
      const saved = await loadItem<AuthUser>(STORAGE_KEYS.auth);
      if (saved) {
        set({user: saved, initializing: false});
      } else {
        set({initializing: false});
      }
    },
    async login(email) {
      const user = {email};
      set({user});
      await saveItem(STORAGE_KEYS.auth, user);
    },
    async signup(email, password) {
      // Real implementation should call backend. For now reuse login.
      await get().login(email, password);
    },
    async logout() {
      set({user: null});
      await saveItem(STORAGE_KEYS.auth, null);
    },
  })
);
