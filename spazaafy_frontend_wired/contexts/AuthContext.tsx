import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Theme } from '../types';
import { MOCK_DB } from '../data/mockData';

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, role: UserRole) => boolean;
    logout: () => void;
    register: (details: Omit<User, 'id'> & { shopName?: string; address?: string }) => void;
    updateUser: (updatedUser: User) => void;
    theme: Theme;
    toggleTheme: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState<Theme>(() => {
        const storedTheme = localStorage.getItem('theme');
        return (storedTheme as Theme) || 'light';
    });

    useEffect(() => {
        // Check for logged-in user in session storage
        try {
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from sessionStorage", error);
            sessionStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    const login = (email: string, role: UserRole): boolean => {
        const foundUser = MOCK_DB.users.findAll().find(u => u.email === email && u.role === role);
        if (foundUser) {
            setUser(foundUser);
            sessionStorage.setItem('user', JSON.stringify(foundUser));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('user');
    };

    const register = (details: Omit<User, 'id'> & { shopName?: string; address?: string; phone?: string }) => {
        const newUser = MOCK_DB.users.create(details);
        setUser(newUser);
        sessionStorage.setItem('user', JSON.stringify(newUser));
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
    };
    
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const value = { user, loading, login, logout, register, updateUser, theme, toggleTheme };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};