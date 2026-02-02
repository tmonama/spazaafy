import { API_BASE } from './mockApi';

async function request(url: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE}${url}`, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
    return data;
}

export const employeeApi = {

    // Auth Flow
    initRegister: (data: any) => request('/hr/public/employee/register-init/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }),

    completeRegister: (data: any) => request('/hr/public/employee/register-complete/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }),
    
    getProfile: (token: string) => request('/hr/portal/me/', { headers: { Authorization: `Bearer ${token}` } }),
    
    getAnnouncements: (token: string) => request('/hr/portal/announcements/', { headers: { Authorization: `Bearer ${token}` } }),
    
    submitResignation: (data: any, token: string) => request('/hr/portal/resign/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
    }),

    getMyComplaints: (token: string) => request('/hr/portal/my_complaints/', { headers: { Authorization: `Bearer ${token}` } }),
    
    fileComplaint: (data: any, token: string) => request('/hr/portal/file_complaint/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
    }),
    
    uploadPhoto: (id: string, file: File, token: string) => {
        const formData = new FormData();
        formData.append('photo', file);
        return fetch(`${API_BASE}/hr/admin/employees/${id}/upload_photo/`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });
    },

    // --- TIME CARD ---

    openTimeCard: async (token: string) => {
    const res = await fetch('/api/hr/portal/open_timecard/', {
        method: 'POST',
        headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        },
    });
    return res.json();
    },

    addTimeEntry: async (timecardId: string, payload: any, token: string) => {
    const res = await fetch(
        `/api/hr/portal/timecard/${timecardId}/add_entry/`,
        {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        }
    );
    return res.json();
    },

    getTimeCardsSummary: async (period: 'day' | 'week' | 'month' | 'year', token: string) => {
        return request(`/hr/portal/timecards_summary/?period=${period}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    sendTimeCardReport: async (payload: any, token: string) => {
    const res = await fetch('/api/hr/portal/send_timecard_report/', {
        method: 'POST',
        headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return res.json();
    },

};