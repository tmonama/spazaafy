import { API_BASE } from './mockApi';

async function request(url: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE}${url}`, options);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
}

export const techApi = {
    // Submit a ticket (Internal User)
    createTicket: async (data: { title: string; description: string; category: string }, token: string) => {
        return request('/support/tech-tickets/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    },

    // Get All Tickets (Tech Admin)
    getTickets: async (token: string) => {
        return request('/support/tech-tickets/', {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // Update Status
    updateTicket: async (id: string, data: Partial<{ status: string; assigned_to: string }>, token: string) => {
        return request(`/support/tech-tickets/${id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    },

    // Get Analytics
    getDashboardStats: async (token: string) => {
        return request('/support/tech-tickets/dashboard_stats/', {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};