import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import mockApi from '../api/mockApi';
import { DocumentStatus, SiteVisitStatus, TicketStatus } from '../types';
import { useAuth } from '../hooks/useAuth'; // ✅ 1. Import useAuth to get the current user

interface AlertCounts {
  pendingDocuments: number;
  pendingVisits: number;
  unverifiedShops: number;
  openTickets: number;
  unreadTickets: number; // ✅ 2. Add new state for unread tickets
}

interface AlertsContextType {
  alerts: AlertCounts;
  refetchAlerts: () => void;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export const AlertsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth(); // ✅ 3. Get the current user

    const [alerts, setAlerts] = useState<AlertCounts>({
        pendingDocuments: 0,
        pendingVisits: 0,
        unverifiedShops: 0,
        openTickets: 0,
        unreadTickets: 0,
    });

    const refetchAlerts = useCallback(async () => {
        if (!user) return; // Don't fetch if no user is logged in

        try {
            // Only fetch tickets for non-admin users to avoid unnecessary calls
            if (user.role !== 'admin') {
                const tickets = await mockApi.tickets.list();
                setAlerts(prev => ({
                    ...prev,
                    unreadTickets: tickets.filter(t => t.unreadForCreator).length
                }));
                return; // End early for non-admins
            }

            // Admin-specific fetching
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
                unreadTickets: tickets.filter(t => t.unreadForAssignee).length, // For admins, check unreadForAssignee
            });
        } catch (error) {
            console.error("Failed to fetch alert counts:", error);
        }
    }, [user]); // ✅ 4. Add user as a dependency

    useEffect(() => {
        refetchAlerts();
        const intervalId = setInterval(refetchAlerts, 30000);
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