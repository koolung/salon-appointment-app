import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'RECEPTION' | 'CLIENT';
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  login: (user, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },
  setLoading: (isLoading) => set({ isLoading }),
}));

// Initialize from localStorage
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  if (token && user) {
    useAuthStore.setState({
      token,
      user: JSON.parse(user),
    });
  }
}
