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
    }
};