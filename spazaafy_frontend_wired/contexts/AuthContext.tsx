import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Theme } from '../types'; // Make sure to import Theme
import mockApi from '../api/mockApi';

// Define the shape of your context data, now including theme properties
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  // ✅ Also corrected this one for consistency
  register: (payload: any) => Promise<User>;

  // ✅ NEW: Google Login Function
  loginWithGoogle: (token: string) => Promise<{ status: 'LOGIN_SUCCESS' | 'REGISTER_REQUIRED'; data?: any }>;

  updateUser: (updatedUser: User) => void;
  theme: Theme;
  toggleTheme: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // --- THEME MANAGEMENT LOGIC (RESTORED) ---
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    return (storedTheme === 'dark' || storedTheme === 'light') ? storedTheme : 'light';
  });

  // Effect to apply the 'dark' class to the <html> element
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  // --- END OF THEME LOGIC ---

  useEffect(() => {
    // On initial app load, check for user in session storage to persist login
    const checkUserSession = () => {
      try {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to parse user from session storage", error);
        sessionStorage.removeItem('user'); // Clear corrupted data
      } finally {
        setLoading(false);
      }
    };
    checkUserSession();
  }, []);

  // --- ASYNCHRONOUS AUTH FUNCTIONS ---
  const login = async (email: string, password: string) => {
    const { user } = await mockApi.auth.login(email, password);
    setUser(user);
    return user; // <-- Return the user from the successful API call
  };

  // ✅ NEW: Google Login Implementation
  const loginWithGoogle = async (token: string) => {
    const response = await mockApi.auth.googleAuth(token);
    
    if (response.status === 'LOGIN_SUCCESS') {
      setUser(response.user);
      return { status: 'LOGIN_SUCCESS', data: response.user };
    } else {
      // Returns { status: 'REGISTER_REQUIRED', email, first_name, last_name }
      return { status: 'REGISTER_REQUIRED', data: response };
    }
  };

  const logout = async () => {
    await mockApi.auth.logout();
    setUser(null);
  };

  const register = async (payload: any) => {
    const { user } = await mockApi.auth.register(payload);
    setUser(user);
    return user;
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // The complete value provided to all components that use the 'useAuth' hook
  const value = { user, loading, login, logout, register, updateUser, theme, toggleTheme };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};