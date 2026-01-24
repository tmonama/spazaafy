import { API_BASE } from './mockApi';

async function request(url: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE}${url}`, options);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
}

async function requestWithFile(url: string, options: any) {
    const res = await fetch(`${API_BASE}${url}`, options);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
}

export const techApi = {
    createTicket: async (data: { title: string; description: string; category: string }, token: string) => {
        return request('/support/tech-tickets/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    },

    getTickets: async (token: string) => {
        return request('/support/tech-tickets/', {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // ✅ New: Get Single Ticket by ID
    getTicketById: async (id: string, token: string) => {
        return request(`/support/tech-tickets/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    updateTicket: async (id: string, data: Partial<{ status: string; assigned_to: string }>, token: string) => {
        return request(`/support/tech-tickets/${id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    },

    getDashboardStats: async (token: string) => {
        return request('/support/tech-tickets/dashboard_stats/', {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // ✅ New: Get Messages
    getMessages: async (ticketId: string, token: string) => {
        return request(`/support/tech-tickets/${ticketId}/messages/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // ✅ New: Send Message
    postMessage: async (ticketId: string, data: { content: string; attachment?: File }, token: string) => {
        const formData = new FormData();
        formData.append('content', data.content);
        if (data.attachment) {
            formData.append('attachment', data.attachment);
        }
        
        // Note: Do NOT set Content-Type header for FormData, browser does it automatically
        return requestWithFile(`/support/tech-tickets/${ticketId}/messages/`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });
    }
};