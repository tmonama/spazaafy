import { API_BASE } from './mockApi'; 

async function request(url: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE}${url}`, options);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
}

export const hrApi = {
    // --- Public ---
    submitJobRequest: async (data: any) => {
        return request('/hr/public/request-hiring/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },
    submitApplication: async (formData: FormData) => {
        return request('/hr/public/apply/', {
            method: 'POST',
            body: formData // Browser handles boundary
        });
    },
    signupTraining: async (data: any) => {
        return request('/hr/public/training-signup/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },
    // ✅ NEW: Public Fetch Methods
    getPublicJobDetails: async (id: string) => {
        return request(`/hr/public/jobs/${id}/`);
    },

    getPublicTrainingDetails: async (id: string) => {
        return request(`/hr/public/training/${id}/`);
    },

    // --- Admin (Hiring) ---
    getHiringRequests: async (token: string) => {
        return request('/hr/admin/hiring/', {
            headers: { Authorization: `Bearer ${token}` }
        });
    },
    openApplications: async (id: string, days: number, description: string, token: string) => {
        return request(`/hr/admin/hiring/${id}/open_applications/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ days, job_description: description })
        });
    },
    getApplications: async (token: string) => {
        return request('/hr/admin/applications/', {
            headers: { Authorization: `Bearer ${token}` }
        });
    },
    scheduleInterview: async (appId: string, date_time: string, type: string, location: string, notes: string, token: string) => {
        return request(`/hr/admin/applications/${appId}/schedule_interview/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ date_time, type, location, notes })
        });
    },
    selectCandidate: async (appId: string, token: string) => {
        return request(`/hr/admin/applications/${appId}/select_candidate/`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    getHiringRequestById: async (id: string, token: string) => {
        return request(`/hr/admin/hiring/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // ✅ Bulk Update Applications
    bulkUpdateApplications: async (ids: string[], status: string, token: string) => {
        return request(`/hr/admin/applications/bulk_update_status/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ids, status })
        });
    },

    // --- Admin (Employees) ---
    getEmployees: async (token: string) => {
        return request('/hr/admin/employees/', {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    updateHiringRequest: async (id: string, data: any, token: string) => {
        return request(`/hr/admin/hiring/${id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    },

    updateEmployeeStatus: async (id: string, status: string, token: string, extraData: any = {}) => {
        return request(`/hr/admin/employees/${id}/`, { // Assuming using standard PATCH on viewset, or custom action
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status, ...extraData })
        });
    },

    // --- Admin (Training) ---
    getTrainings: async (token: string) => {
        return request('/hr/admin/training/', {
            headers: { Authorization: `Bearer ${token}` }
        });
    },
    createTraining: async (data: any, token: string) => {
        return request('/hr/admin/training/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    },
    markAttendance: async (sessionId: string, employeeIds: string[], token: string) => {
        return request(`/hr/admin/training/${sessionId}/mark_attendance/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ employee_ids: employeeIds })
        });
    },
    getTrainingById: async (id: string, token: string) => {
        return request(`/hr/admin/training/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },
    getEmployeeById: async (id: string, token: string) => {
        return request(`/hr/admin/employees/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // ✅ Upload Profile Photo
    uploadEmployeePhoto: async (id: string, file: File, token: string) => {
        const formData = new FormData();
        formData.append('photo', file);
        return request(`/hr/admin/employees/${id}/upload_photo/`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }, // No Content-Type for FormData
            body: formData
        });
    },
    initiateTermination: async (id: string, reason: string, token: string) => {
        return request(`/hr/admin/employees/${id}/initiate_termination/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ reason })
        });
    },
    finalizeTermination: async (id: string, token: string) => {
        return request(`/hr/admin/employees/${id}/finalize_termination/`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
    },
    getComplaints: async (token: string) => {
        return request('/hr/admin/complaints/', { headers: { Authorization: `Bearer ${token}` } });
    },
    getAnnouncements: async (token: string) => {
        return request('/hr/admin/announcements/', {
            headers: { Authorization: `Bearer ${token}` }
        });
    },
    createAnnouncement: async (data: { title: string; content: string }, token: string) => {
        return request('/hr/admin/announcements/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    },
    deleteAnnouncement: async (id: string, token: string) => {
        return request(`/hr/admin/announcements/${id}/`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};