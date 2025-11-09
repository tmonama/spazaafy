// src/context/SidebarContext.tsx

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface SidebarContextType {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    return (
        <SidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};