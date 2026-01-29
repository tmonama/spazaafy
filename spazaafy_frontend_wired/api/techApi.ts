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
    },

    // --- Status Page (Public) ---
    getPublicStatus: async () => {
        // No token needed
        return request('/core/status/public/');
    },

    // --- Status Admin (Protected) ---
    getComponents: async (token: string) => {
        return request('/core/status-admin/', {
            headers: { Authorization: `Bearer ${token}` }
        });
    },
    
    updateComponentStatus: async (id: string, status: string, token: string) => {
        return request('/core/status-admin/update_component/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id, status })
        });
    },

    getIncidents: async (token: string) => {
        return request('/core/status-admin/?type=incident', {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    createIncident: async (data: any, token: string) => {
        return request('/core/status-admin/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(data) // body includes type='incident' logic implicitly handled by saving to correct endpoint if RESTful, 
            // BUT actually for ModelViewSet we need to handle creation carefully. 
            // Let's refine the backend view or simply use a separate endpoint.
            // For simplicity, let's assume the backend handles POST to /core/status-admin/ based on body payload or we create a specific one.
            // Actually, simpler: Let's create a dedicated 'create_incident' action in backend or just use a separate router. 
            // **Correction:** To keep it simple, I will update the backend `create` method logic or just use:
            // POST /core/status-admin/ assuming default is Component, but we need Incident.
            // Let's add a specific endpoint for incidents in frontend.
        });
    },
    
    // Better Approach for Frontend:
    // We will just use the updateComponent for components.
    // And for Incidents, we will add a specific path.
    
    createSystemIncident: async(data: any, token: string) => {
         // We need to fetch from a specific URL if we use the same ViewSet with query params
         // It's cleaner to add a separate ViewSet action or just use query param in POST
         const url = new URL(`${API_BASE}/core/status-admin/`);
         url.searchParams.append('type', 'incident');
         const res = await fetch(url.toString(), {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
             body: JSON.stringify(data)
         });
         return res.json();
    },
    
    resolveIncident: async(id: string, token: string) => {
         const url = new URL(`${API_BASE}/core/status-admin/${id}/`);
         url.searchParams.append('type', 'incident');
         const res = await fetch(url.toString(), {
             method: 'PATCH',
             headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
             body: JSON.stringify({ status: 'RESOLVED' })
         });
         return res.json();
    }
};