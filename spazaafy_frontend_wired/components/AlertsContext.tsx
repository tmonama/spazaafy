// src/context/AlertsContext.tsx

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import mockApi from '../api/mockApi';
import { DocumentStatus, SiteVisitStatus, TicketStatus } from '../types';

interface AlertCounts {
  pendingDocuments: number;
  pendingVisits: number;
  unverifiedShops: number;
  openTickets: number;
}

interface AlertsContextType {
  alerts: AlertCounts;
  refetchAlerts: () => void;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export const AlertsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [alerts, setAlerts] = useState<AlertCounts>({
        pendingDocuments: 0,
        pendingVisits: 0,
        unverifiedShops: 0,
        openTickets: 0,
    });

    const refetchAlerts = useCallback(async () => {
        try {
            const [documents, visits, shops, tickets] = await Promise.all([
                mockApi.documents.list(),
                mockApi.visits.list(),
                mockApi.shops.getAll(),
                mockApi.tickets.list(),
            ]);

            setAlerts({
                pendingDocuments: documents.filter(d => d.status === DocumentStatus.PENDING).length,
                pendingVisits: visits.filter(v => v.status === SiteVisitStatus.PENDING).length,
                unverifiedShops: shops.filter(s => !s.isVerified).length,
                openTickets: tickets.filter(t => t.status === TicketStatus.OPEN).length,
            });
        } catch (error) {
            console.error("Failed to fetch alert counts:", error);
        }
    }, []);

    useEffect(() => {
        // Fetch immediately on component mount
        refetchAlerts();

        // Optional: Poll for new alerts every 30 seconds
        const intervalId = setInterval(refetchAlerts, 30000);

        // Cleanup on component unmount
        return () => clearInterval(intervalId);
    }, [refetchAlerts]);

    return (
        <AlertsContext.Provider value={{ alerts, refetchAlerts }}>
            {children}
        </AlertsContext.Provider>
    );
};

export const useAlerts = () => {
    const context = useContext(AlertsContext);
    if (context === undefined) {
        throw new Error('useAlerts must be used within an AlertsProvider');
    }
    return context;
};