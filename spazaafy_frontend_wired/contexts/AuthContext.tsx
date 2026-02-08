import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Theme, UserRole } from '../types';
import mockApi from '../api/mockApi';

export interface AuthContextType {
  user: User | null;
  token: string | null; // ✅ Added to fix TS errors in pages
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (payload: any) => Promise<User>;
  loginWithGoogle: (token: string) => Promise<{ status: 'LOGIN_SUCCESS' | 'REGISTER_REQUIRED'; data?: any }>;
  updateUser: (updatedUser: User) => void;
  theme: Theme;
  toggleTheme: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('access'));
  const [loading, setLoading] = useState(true);

  // ✅ Router Hooks for redirection
  const navigate = useNavigate();
  const location = useLocation();

  // --- THEME MANAGEMENT LOGIC ---
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    return (storedTheme === 'dark' || storedTheme === 'light') ? storedTheme : 'light';
  });

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
    const checkUserSession = () => {
      try {
        const storedUser = sessionStorage.getItem('user');
        const storedToken = sessionStorage.getItem('access');
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Failed to parse user from session storage", error);
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('access');
      } finally {
        setLoading(false);
      }
    };
    checkUserSession();
  }, []);

  // --- AUTH FUNCTIONS ---

  const login = async (email: string, password: string) => {
    const res = await mockApi.auth.login(email, password);
    setUser(res.user);
    setToken(res.access);
    return res.user;
  };

  const loginWithGoogle = async (googleToken: string) => {
    const response = await mockApi.auth.googleAuth(googleToken);
    
    if (response.status === 'LOGIN_SUCCESS') {
      setUser(response.user);
      setToken(response.access);
      return { status: 'LOGIN_SUCCESS', data: response.user };
    } else {
      return { status: 'REGISTER_REQUIRED', data: response };
    }
  };

  // ✅ UPDATED LOGOUT LOGIC
  const logout = async () => {
    // 1. Determine redirect path based on current portal
    const currentPath = location.pathname;
    let redirectPath = '/login';

    if (currentPath.startsWith('/legal')) {
        redirectPath = '/legal/login';
    } else if (currentPath.startsWith('/hr')) {
        redirectPath = '/hr/login';
    } else if (currentPath.startsWith('/tech')) {
        redirectPath = '/tech/login';
    } else if (currentPath.startsWith('/employee')) {
        redirectPath = '/employee/login';
    } else if (currentPath.startsWith('/admin')) {
        redirectPath = '/admin-login';
    }

    // 2. Perform Logout
    try {
      await mockApi.auth.logout();
    } catch (e) {
      console.error("Logout API failed", e);
    }

    // 3. Clear State
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('access');
    sessionStorage.removeItem('refresh');

    // 4. Redirect
    navigate(redirectPath);
  };

  const register = async (payload: any) => {
    // Note: Depending on backend, register might not return { user } immediately (if verification needed)
    // Adjust based on your specific register response structure
    const response: any = await mockApi.auth.register(payload);
    if (response.user) {
        setUser(response.user);
        return response.user;
    }
    return response;
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = { 
    user, 
    token, // ✅ Exposed to context consumers
    loading, 
    login, 
    loginWithGoogle, 
    logout, 
    register, 
    updateUser, 
    theme, 
    toggleTheme 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};